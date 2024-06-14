import React, { forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react";
import { showErrorModal } from "../../dialogs/Dialog";
import { Button } from "semantic-ui-react";



interface TencentCaptchaRefType {
    refresh: () => void;
}

interface TencentCaptchaProps {
    appId: string;
    onSuccessLoad: () => void;
    onSuccess: (resp: TencentCaptchaAuthResp) => void;
};

interface TencentCaptchaAuthResp {
    ret: number;
    ticket: string;
    randstr: string;
}

const TencentCaptcha = ({ appId, onSuccess, onSuccessLoad }: TencentCaptchaProps, ref: React.Ref<TencentCaptchaRefType>) => {
    const [captchaObj, setCaptchaObj] = useState<{ refresh: () => void; show: () => void; } | null>(null);
    const functionRef = useRef<{ load: () => void; success: (resp: TencentCaptchaAuthResp) => void }>();
    useLayoutEffect(() => {
        functionRef.current = {
            load: onSuccessLoad,
            success: onSuccess
        };
    }, [onSuccess, onSuccessLoad]);
    useEffect(() => {
        if (captchaObj !== null) {
            const func = () => { };
            if (typeof ref === "function") ref({ refresh: func });
            else if (ref !== null) (ref as any).current = ({ refresh: func });
        }
    }, [ref, captchaObj]);
    useEffect(() => {
        try {
            const obj: any = new (window as any).TencentCaptcha(appId, (resp: TencentCaptchaAuthResp) => {
                // console.log("done", resp);
                if (resp.ret === 0) functionRef.current?.success(resp);
            }, {
                loading: true,
                type: "popup"
            });
            setCaptchaObj(obj as any);
            functionRef.current?.load();
            // console.log("obj=", obj);
            return () => {
                obj.destroy();
            }
        } catch (e) {
            showErrorModal(`加载验证码失败: ${e}`);
        }

    }, [appId]);


    return <div >
        <Button color="green" onClick={() => captchaObj?.show()}>点此进行验证并发送短信</Button>
    </div>;

};
export type { TencentCaptchaRefType, TencentCaptchaAuthResp }
export default forwardRef<TencentCaptchaRefType, TencentCaptchaProps>(TencentCaptcha);
