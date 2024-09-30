const express = require('express');
const cors = require('cors');
const axios = require('axios');
var bodyParser = require('body-parser');

const app = express();

const PORT = 3010;




app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all('*', async (req, res) => {
    delete req.headers.host
    delete req.headers.referer
    const API_URL = "https://api.dev1.mosip.net/v1/mimoto";
    // const API_URL = req.url.indexOf("mimoto")!==-1 ? 'https://api.dev1.mosip.net/residentmobileapp' :
    //     'https://esignet.dev1.mosip.net/';
    //const path = req.url.replace("/mimoto","").replace("/esignet","")
    const path = req.url
    try {
        let response = {};
        if(path.indexOf("get-token") !== -1 ) {
            response = await axios({
                method: req.method,
                url: `${API_URL}/get-token/Sunbird`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "Accept": 'application/json'
                },
                data: new URLSearchParams({
                    'grant_type': 'authorization_code',
                    'code': req.body.code,
                    'client_id': req.body.client_id,
                    'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
                    'client_assertion': '',
                    'redirect_uri': "http://localhost:3001/redirect",
                    'code_verifier': req.body.code_verifier
                })
            });
            res.status(response.status).json(response.data);
        } else if(path.indexOf("download") !== -1 ) {
            res.setHeader('Access-Control-Allow-Origin', '*'); // Change '*' to specific origin if needed
            res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS'); // Allow GET requests
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers

            response = await axios({
                method: req.method,
                url: `${API_URL}/issuers/Sunbird/credentials/InsuranceCredential/download`,
                headers: {
                    'Bearer': req.query.token,
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                },
                responseType: 'blob'
            });
            res.status(response.status).json(response.data);
        } else if(path.indexOf("dummy") !== -1 ) {
            res.setHeader('Access-Control-Allow-Origin', '*'); // Change '*' to specific origin if needed
            res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS'); // Allow GET requests
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
            res.status(400).json({
                "id": "mosip.mimoto.idp",
                "version": null,
                "str": null,
                "responsetime": "2024-07-26T12:08:47.455Z",
                "metadata": null,
                "response": null,
                "errors": [
                    {
                        "errorCode": "proof_type_not_supported",
                        "errorMessage": "Signature Verification Failed"
                    }
                ]
            });
        } else {
            response = await axios({
                method: req.method,
                url: `${API_URL}${path}`,
                headers: req.headers,
                data: new URLSearchParams(req.body)
            });
            res.status(response.status).json(response.data);
        }

    } catch (error) {
        console.error("Error occurred: ", error);
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});
