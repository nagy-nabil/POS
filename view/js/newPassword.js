const submit  = document.getElementById("submit")
submit.addEventListener("click",()=>{
    const pass = document.getElementById("password")
    const passRE = document.getElementById("passwordRepeat")
    console.log(pass.value ,passRE.value)
    if(pass.value === passRE.value)
    console.log("the same")
})