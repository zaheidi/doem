// 云函数入口文件
const cloud = require('wx-server-sdk')
const axios = require('axios') // 需要 npm install axios
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
    // 从环境变量中安全读取 Key
    const API_KEY = process.env.DEEPSEEK_API_KEY; 
    
    const { resumeText, jobDescription } = event;
  
    try {
      const res = await axios.post('https://api.deepseek.com/chat/completions', {
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是一个HR专家，请对简历和岗位进行匹配度打分（0-100）。" },
          { role: "user", content: `简历：${resumeText} \n 岗位：${jobDescription}` }
        ],
        // 建议强制要求 JSON 输出，方便 Dev B 和 Dev C 解析
        response_format: { type: "json_object" } 
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
  
      return {
        code: 200,
        result: JSON.parse(res.data.choices[0].message.content)
      };
    } catch (e) {
      return { code: 500, msg: "AI服务调用失败" };
    }
  }