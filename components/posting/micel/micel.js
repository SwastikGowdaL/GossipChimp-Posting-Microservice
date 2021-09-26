//* testing virus total malicious url detection
// const maliciousUrlDetection = async (link) => {
//   try {
//     const URL1 = 'https://www.virustotal.com/api/v3/urls';
//     const URL2 = 'https://www.virustotal.com/api/v3/analyses/';
//     const data = new FormData();
//     data.append('url', link);
//     const axiosConfig = {
//       method: 'post',
//       url: URL1,
//       headers: {
//         'x-apikey': config.virusTotalApiKey,
//         ...data.getHeaders(),
//       },
//       data,
//     };
//     const response = await axios(axiosConfig);

//     let res = await axios.get(`${URL2}${response.data.data.id}`, {
//       headers: {
//         'x-apikey': config.virusTotalApiKey,
//       },
//     });

//     while (res.data.data.attributes.status === 'queued') {
//       const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
//       await delay(75);
//       res = await axios.get(`${URL2}${response.data.data.id}`, {
//         headers: {
//           'x-apikey': config.virusTotalApiKey,
//         },
//       });
//     }

//     if (
//       res.data.data.attributes.stats.malicious > 0 ||
//       res.data.data.attributes.stats.suspicious > 0
//     ) {
//       return true;
//     }

//     return false;
//   } catch (err) {
//     if (err instanceof ErrorHandler) {
//       throw err;
//     }
//     throw new ErrorHandler(
//       500,
//       err.message,
//       'error in postingService maliciousUrlDetection()',
//       false
//     );
//   }
// };

//* checks whether the provided link is malicious or not
// const maliciousUrlDetection = async (link) => {
//     try {
//       const URL = 'https://ipqualityscore.com/api/json/url/';
//       const formatedLink = helpers.formatLink(link);
//       const response = await axios.get(
//         `${URL}${config.maliciousUrlScannerKey}/${formatedLink}`
//       );
//       return response.data.unsafe;
//     } catch (err) {
//       if (err instanceof ErrorHandler) {
//         throw err;
//       }
//       throw new ErrorHandler(
//         500,
//         err.message,
//         'error in postingService maliciousUrlDetection()',
//         false
//       );
//     }
//   };
