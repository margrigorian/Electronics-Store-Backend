import responseTemplate from "../lib/responseTemplate.js";
import { checkUser} from "../servicing/authService.js";

export async function userRegistrationController(req, res) {
    try{
        let message;

        const {username, email, password} = req.body;
        const user = await checkUser(email, password);

        return res.status(200).json('work');
    }catch(err) {
        const message = "500 Server Error";
        const response = responseTemplate;
        response.error = {
            message
        };
        return res.status(500).json(response);
    }
}