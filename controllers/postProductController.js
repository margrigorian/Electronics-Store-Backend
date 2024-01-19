import getResponseTemplate from "../lib/responseTemplate.js";

export async function postProductController(req, res) {
    try{
        let message;
        const response = getResponseTemplate();
        console.log(req.file);

        response.data = {
            data: req.file
        }
        return res.status(201).json(response);
    }catch(err) {
        const message = "500 Server Error";
        const response = getResponseTemplate();
        response.error = {
            message
        }
        return res.status(500).json(response);
    }
}