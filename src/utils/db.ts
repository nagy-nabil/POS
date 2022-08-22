import mongoose from "mongoose";
export function connect(){
    mongoose.connect('mongodb+srv://nagy-nabil:mennaallah203@cluster0.rkzoltz.mongodb.net/?retryWrites=true&w=majority') 

    mongoose.connection.on('connected', function () {  
      console.log('Mongoose default connection open');
    }); 
    
    mongoose.connection.on('error',function (err) {  
      console.log('Mongoose default connection error: ' + err);
    }); 
    
    mongoose.connection.on('disconnected', function () {  
      console.log('Mongoose default connection disconnected'); 
    });
    
    process.on('SIGINT', function() {  
      mongoose.connection.close(function () { 
        console.log('Mongoose default connection disconnected through app termination'); 
        process.exit(0); 
      }); 
    });
}
