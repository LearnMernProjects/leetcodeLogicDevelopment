export function getJudge0LanguageId(language) {
    const languageMap={
        "C": 50,
        "CPP": 54,
        "JAVA": 62,
        "PYTHON": 71,
        "JAVASCRIPT": 63,
        "GO": 72,

    };
    return languageMap[language.toUpperCase()];
}
export async function submitBatch(submission){
    const data = await axios.post(`${process.env.JUDGE0_URL}/submissions/batch?base64_encoded=false`, 
       {submission}
    )
    ;
    console.log("Batch submission response:",data);
    return data;
}
export async function pollBatchResults(tokens){
    while(true){
        const {data} = await axios.get(`${process.env.JUDGE0_URL}/submissions/batch`,
            {
                params: {
                    tokens: tokens.join(","),
                    base64_encoded: false,
                }
            }
        );
console.log(data);
const results = data.submissions;
const isAllDone = results.every(res => res.status.id >= 3);
if(isAllDone){
    await sleep(1000)
    return results;
}
    }
}
export function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}