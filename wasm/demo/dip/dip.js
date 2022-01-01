// 获取相关的 HTML 元素
let video = document.querySelector('.video')
let canvas = document.querySelector('.canvas')
let fpsNum = document.querySelector('.fps-num')

// 使用 getContext 方法获取 <canvas> 标签对应的一个 CanvasRenderingContext2D 接口
let context = canvas.getContext('2d')

// 自动播放 <video> 载入的视频
let promise = video.play()
if (promise) {
    promise.catch(error => {
        console.error('The video can not autoplay!')
    })
}

const records = []
let lastDrawTime = 0

// 定义绘制函数
function draw() {
    if (lastDrawTime !== 0) {
        const duration = Date.now() - lastDrawTime
        records.push(duration)
    }
    lastDrawTime = Date.now()

    // 调用 drawImage 函数绘制图像到 <canvas>
    context.drawImage(video, 0, 0)

    // 获取 <canvas> 上当前帧对应画面的像素数组
    let pixels = context.getImageData(0, 0, video.videoWidth, video.videoHeight)

    switch (globalStatus) {
        case "NONE":
            break
        case "JS":
            jsConvFilter(pixels.data, pixels.width, pixels.height, kernel)
            context.putImageData(pixels, 0, 0)
            break
        case "WASM":
            const data = filterWASM(pixels.data, pixels.width, pixels.height)
            context.putImageData(new ImageData(new Uint8ClampedArray(data), pixels.width, pixels.height), 0, 0)
            break
    }

    // requestAnimationFrame(draw)
    setTimeout(draw, 0)

    fpsNum.textContent = calcFPS()
}

// <video> 视频资源加载完毕后执行
video.addEventListener('loadeddata', () => {
    // 根据 <video> 载入视频大小调整对应的 <canvas> 尺寸
    canvas.setAttribute('width', video.videoWidth)
    canvas.setAttribute('height', video.videoHeight)

    // 绘制函数入口
    draw()
})


// 当前状态
let globalStatus = 'NONE'

const inputs = document.querySelectorAll('[name=options]')
for (const input of inputs) {
    input.addEventListener('change', evt => {
        globalStatus = evt.target.value
    })
}

function calcFPS() {
    // 提取容器中的前 20 个元素来计算平均值
    const AVERAGE_RECORDS_COUNT = 20
    if (records.length > AVERAGE_RECORDS_COUNT) {
        records.shift() // 移除最老的一个数据，维护容器大小保存为20
    } else {
        return 0
    }

    // 计算平均每帧在绘制过程中所消耗的时间
    let averageTime = records.reduce((pre, item) => pre + item, 0) / Math.abs(records.length)
    // 估算出 1s 内能够绘制的帧数
    return (1000 / averageTime).toFixed(2)
}

// 矩阵翻转函数
function flipKernel(kernel) {
    const h = kernel.length
    const half = Math.floor(h / 2)

    // 按中心对称的方式将矩阵中的数字上下、左右进行互换
    for (let i = 0; i < half; i++) {
        for (let j = 0; j < h; j++) {
            let _t = kernel[i][j]
            kernel[i][j] = kernel[h - i - 1][h - j - 1]
            kernel[h - i - 1][h - j - 1] = _t
        }
    }

    // 处理矩阵行数为奇数的情况
    if (h % 2) {
        // 将中间行左右两侧对称位置的数进行互换
        for (let j = 0; j < half; j++) {
            let _t = kernel[half][j]
            kernel[half][j] = kernel[half][h - j - 1]
            kernel[half][h - j - 1] = _t
        }
    }
    return kernel
}
// 得到经过翻转 180 度后的卷积核矩阵
const kernel = flipKernel([
    [-1, -1, 1],
    [-1, 14, -1],
    [1, -1, -1]
])

function jsConvFilter(data, width, height, kernel) {
    const divisor = 4
    const h = kernel.length, w = h
    const half = Math.floor(h / 2)

    // 根据卷积核的大小来忽略对边缘像素的处理
    for (let y = half; y < height - half; y++) {
        for (let x = half; x < width - half; x++) {
            // 每个像素点在像素分量数组中的起始位置
            const px = (y * width + x) * 4
            let r = 0, g = 0, b = 0
            // 与卷积核矩阵数组进行运算
            for (let cy = 0; cy < h; cy++) {
                for (let cx = 0; cx < w; cx++) {
                    // 获取卷积核矩阵所覆盖位置的每一个像素的起始偏移位置
                    const cpx = ((y + (cy - half)) * width + (x + (cx - half))) * 4
                    // 对卷积核中心像素点的 RGB 各分量进行卷积计算(累加)
                    r += data[cpx + 0] * kernel[cy][cx]
                    g += data[cpx + 1] * kernel[cy][cx]
                    b += data[cpx + 2] * kernel[cy][cx]
                }
            }

            // 处理 RGB 三个分量的卷积结果
            data[px + 0] = ((r / divisor) > 255) ? 255 : ((r / divisor) < 0) ? 0 : r
            data[px + 1] = ((g / divisor) > 255) ? 255 : ((g / divisor) < 0) ? 0 : g
            data[px + 2] = ((b / divisor) > 255) ? 255 : ((b / divisor) < 0) ? 0 : b
        }
    }
    return data
}

(async () => {
    let bytes = await (await fetch('dip.wasm')).arrayBuffer()
    let { module, instance } = await WebAssembly.instantiate(bytes)
    let {
        cppConvFilter,
        cppGetKernelPtr,
        cppGetDataPtr,
        memory,
    } = instance.exports

    // 获取 C/C++ 中存有卷积核矩阵和帧像素数据的数组，在 Wasm 线性内存段中的偏移位置
    const dataOffset = cppGetDataPtr();
    const kernelOffset = cppGetKernelPtr();

    // 扁平化卷积核的二维数组到一维数组，以方便数据的填充
    const flagKernel = kernel.reduce((acc, cur) => acc.concat(cur), [])

    // 为 Wasm 模块的线性内存段设置两个用于进行数据操作的视图，分别对应卷积核矩阵和帧像素数据
    let Uint8View = new Uint8Array(memory.buffer)
    let Int8View = new Int8Array(memory.buffer)

    // 填充卷积核矩阵数据
    Int8View.set(flagKernel, kernelOffset)

    // 封装 Wasm 滤镜处理函数
    function filterWASM(pixelData, width, height) {
        const arLen = pixelData.length
        // 填充当前帧画面的像素数据
        Uint8View.set(pixelData, dataOffset)
        // 调用滤镜处理函数
        cppConvFilter(width, height, 4);
        // 返回经过处理的数据
        return Uint8View.subarray(dataOffset, dataOffset + arLen)
    }
    window.filterWASM = filterWASM
})()
