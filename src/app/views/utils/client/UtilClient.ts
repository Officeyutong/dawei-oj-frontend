import GeneralClient from "../../../common/GeneralClient";
import { PhoneNumberUsingState, ProgrammingLanguageEntry } from "../../../common/types";
import { TencentCaptchaPreparationResp } from "./types";

class UtilClient extends GeneralClient {
    async recaptchaPreparation(): Promise<TencentCaptchaPreparationResp> {
        return (await this.client!.post("/api/phoneutil/preparation")).data;
    }
    async sendSMSCode(phone: string, client_response: any, use_state: PhoneNumberUsingState): Promise<{ code: number; message: string }> {
        return (await this.unwrapClient!.post("/api/phoneutil/sendcode", { phone: phone, client_response: client_response, use_state })).data;
    }
    async getSupportedLanguages(): Promise<ProgrammingLanguageEntry[]> {
        const resp = await (await this.client!.post("/api/get_supported_langs")).data;
        return resp;
    }
    async importFromSYZOJ2(url: string, willPublic: boolean): Promise<{ problem_id: number }> {
        return (await this.unwrapExtraClient!.post("/api/import_from_syzoj", { url, willPublic })).data;
    }
    async importFromSYZOJNG(api_server: string, problem_id: number, willPublic: boolean): Promise<{ problem_id: number }> {
        return (await this.unwrapExtraClient!.post("/api/utils/import_from_syzoj_ng", { api_server, problem_id, "public": willPublic })).data;
    }
};

const utilClient = new UtilClient();

export default utilClient;
