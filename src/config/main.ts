export default {
    jwt:{
        secret:  process.env.SECRET ,
        expiresin:  process.env.EXPIRESIN ,
        activeSecret:  process.env.ACTIVESECRET ,
        activeEspires:  process.env.ACTIVEESPIRES ,
        resetSecret:  process.env.RESETSECRET ,
        resetEspires:  process.env.RESETESPIRES   
    },
}