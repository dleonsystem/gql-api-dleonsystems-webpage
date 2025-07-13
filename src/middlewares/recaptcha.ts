import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';
import dotenv from 'dotenv';
import logger from '../lib/logger';
dotenv.config();

export async function verificarTokenReCaptcha(token: string): Promise<boolean> {
  const projectId = process.env.RECAPTCHA_PROJECT_ID!;
  const siteKey = process.env.RECAPTCHA_SITE_KEY!;
  const expectedAction = 'registro'; // debe coincidir con el action del frontend
  const expectedAction2 = 'login'; // debe coincidir con el action del frontend

  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectId);

  try {
    const [response] = await client.createAssessment({
      parent: projectPath,
      assessment: {
        event: {
          token,
          siteKey,
        },
      },
    });

    const valid = response.tokenProperties?.valid;
    const action = response.tokenProperties?.action;
    const score = response.riskAnalysis?.score ?? 0;

    if (!valid) {
      logger.error('Token inválido:', response.tokenProperties?.invalidReason);
      return false;
    }

    if (action !== expectedAction && action !== expectedAction2) {
      logger.warn(`Acción esperada "${expectedAction}" o "${expectedAction2}", pero se recibió: "${action}"`);
      return false;
    }

    return score >= 0.5;
  } catch (err) {
    logger.error('Error en evaluación reCAPTCHA Enterprise:', err);
    return false;
  }
}
