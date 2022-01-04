function add(num1, num2) {
    return num1 + num2
}

function sum(nums) {
    console.log(nums.length)
    return nums.reduce((total, num) => total + num, 0)
}

sum()
