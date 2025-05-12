import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_HTML = `
<!DOCTYPE html>
<html lang="en">
<meta charset="UTF-8" />
<title>{{subject}}</title>

<style>
    body { margin:0;font-family:Arial,Helvetica,sans-serif;background:#f5f5f7 }
    .box { max-width:600px;margin:0 auto;background:#fff;border-radius:8px }
    .hdr { background:#4f46e5;color:#fff;text-align:center;padding:20px;font-size:20px }
    .cnt { padding:24px;color:#333;line-height:1.4 }
    .btn { display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;
        border-radius:6px;text-decoration:none;font-weight:600;margin:24px 0 }
    .ftr { font-size:12px;color:#777;text-align:center;padding:16px }
</style>

<body>
    <div class="box">
    <div class="hdr">{{companyName}}</div>

    <div class="cnt">
        <p>Hello, {{firstName}} 👋</p>

        <p>Click the button below to activate your account:</p>
        <a href="{{activationUrl}}" class="btn">Activate Account</a>

    </div>

    <div class="ftr">
        You received this email because you created an account on {{productName}}.
    </div>
    </div>
</body>
</html>
`;

export const ActionParamInput = ({ param, value, onChange }) => {

    switch (param.type) {
        case "textarea":
            return (
                <Textarea
                    id={ param.name }
                    value={ value || '' }
                    onChange={ (e) => onChange(param.name, e.target.value) }
                    required={ param.required }
                    placeholder="Use {{variable}} for dynamic values"
                />
            );
        
        case "input":
            return (
                <Input
                    id={ param.name }
                    value={ value || '' }
                    onChange={ (e) => onChange(param.name, e.target.value) }
                    required={ param.required }
                    type="text"
                />
            );
        
        case "array":
            return (
                <Input
                    id={ param.name }
                    value={ value || '' }
                    onChange={ (e) => onChange(param.name, [...e.target.value.split(",").map(mail => mail.trim())]) }
                    required={ param.required }
                    placeholder="Introduce comma separated values"
                    type="text"
                />
            );

        case "html":
            return (
                <Textarea
                    id={ param.name }
                    value={ value || DEFAULT_HTML}
                    onChange={ (e) => onChange(param.name, e.target.value) }
                    required={ param.required }
                    placeholder="Use {{variable}} for dynamic values"
                />
            );
        
        default:
            return (
                <Input
                    id={ param.name }
                    value={ value || '' }
                    onChange={ (e) => onChange(param.name, e.target.value) }
                    required={ param.required }
                    type="text"
                />
            );
    }
    
}