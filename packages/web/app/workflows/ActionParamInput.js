import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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

    const handleChange = (e) => {
        onChange(param.name, e.target.value, param.encrypted);
    };

    switch (param.type) {
        case "textarea":
            return (
                <Textarea
                    id={ param.name }
                    value={ value || '' }
                    onChange={ handleChange }
                    required={ param.required }
                    placeholder="Use {{variable}} for dynamic values"
                />
            );
        
        case "input":
            return (
                <Input
                    id={ param.name }
                    value={ value || '' }
                    onChange={ handleChange }
                    required={ param.required }
                    type="text"
                />
            );
        
        case "array":
            return (
                <div className="space-y-2">
                {Array.isArray(value) ? value.map((item, index) => (
                    <div key={index} className="flex gap-2">
                        <Input
                            type="text"
                            value={item}
                            onChange={(e) => {
                                const newValue = [...value];
                                newValue[index] = e.target.value;
                                onChange(param.name, newValue, param.encrypted);
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder={`Item ${index + 1}`}
                        />
                        <Button
                            onClick={() => {
                                const newValue = value.filter((_, i) => i !== index);
                                onChange(param.name, newValue, param.encrypted);
                            }}
                            className="px-2 py-1 text-red-500 hover:text-red-700"
                        >
                            Remove
                        </Button>
                    </div>
                )) : null}
                    <Button
                        onClick={() => {
                            const newValue = [...(value || []), ''];
                            onChange(param.name, newValue, param.encrypted);
                        }}
                        className="text-sm text-blue-500 hover:text-blue-700"
                        >
                        + Add Item
                    </Button>
                </div>
            );

        case "html":
            return (
                <Textarea
                    id={ param.name }
                    value={ value || DEFAULT_HTML}
                    onChange={ handleChange }
                    required={ param.required }
                    placeholder="Use {{variable}} for dynamic values"
                />
            );
        
        default:
            return (
                <Input
                    id={ param.name }
                    value={ value || '' }
                    onChange={ handleChange }
                    required={ param.required }
                    type="text"
                />
            );
    }
    
}