interface RecaptchaPreparationResp {
    provider: "recaptcha";
    site_key: string;
}

interface TencentCaptchaPreparationResp {
    provider: "tencent";
    app_id: string;
}

type CaptchaPreparationResp = RecaptchaPreparationResp | TencentCaptchaPreparationResp;

export type {
    CaptchaPreparationResp,
    RecaptchaPreparationResp,
    TencentCaptchaPreparationResp
}
