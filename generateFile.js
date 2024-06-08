
const path= require('path');
const fs= require('fs');

const{v4:uuid}= require('uuid');  

const codesdir= path.join(__dirname,'codes');

if(codesdir && !fs.existsSync(codesdir))
    {
        fs.mkdirSync(codesdir,{recursive:true});
    }


const generateFile = async(format,code) => {
        const jobId=uuid();
        const filename=`${jobId}.${format}`;
        const filepath=path.join(codesdir,`${jobId}.${format}`);
        await fs.writeFileSync(filepath,code);
        return filepath; 
}


module.exports={generateFile}