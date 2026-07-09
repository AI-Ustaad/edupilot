// lib/automation/workflow-engine.ts
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger/logger";

// یہ تمام Triggers ہیں جو سسٹم میں ہو سکتے ہیں
export type WorkflowTrigger = 
  | "attendance.absent" 
  | "fee.collected" 
  | "fee.due"
  | "homework.assigned";

interface WorkflowContext {
  tenantId: string;
  trigger: WorkflowTrigger;
  data: any; // اس Event سے متعلق ڈیٹا (جیسے سٹوڈنٹ کا نام، ای میل وغیرہ)
}

// 🚀 یہ مین Engine ہے جو Event سنے گی اور Email بھیجے گی
export async function executeWorkflows(context: WorkflowContext) {
  const { trigger, data } = context;

  try {
    switch (trigger) {
      
      // 1. اگر سٹوڈنٹ Absent ہو
      case "attendance.absent":
        if (data.parentEmail) {
          await sendEmail(
            data.parentEmail,
            `Absence Alert: ${data.studentName}`,
            `<p>Dear Parent,</p>
             <p>This is to inform you that your child <strong>${data.studentName}</strong> was marked <strong>Absent</strong> on ${data.date}.</p>
             <p>If this is unexpected, please contact the school administration.</p>
             <br><p>Regards,<br>EduPilot Administration</p>`
          );
          logger.info(`Workflow: Absence email sent to ${data.parentEmail}`);
        }
        break;

      // 2. اگر فیس جمع ہو جائے
      case "fee.collected":
        if (data.parentEmail) {
          await sendEmail(
            data.parentEmail,
            `Fee Receipt: ${data.studentName}`,
            `<p>Dear Parent,</p>
             <p>We have successfully received the fee payment of <strong>Rs. ${data.amount}</strong> for ${data.studentName} for the month of ${data.month}.</p>
             <p>Thank you for your prompt payment.</p>
             <br><p>Regards,<br>EduPilot Accounts Department</p>`
          );
          logger.info(`Workflow: Fee receipt email sent to ${data.parentEmail}`);
        }
        break;

      // یہاں آپ مستقبل میں اور Triggers شامل کر سکتے ہیں
      // case "fee.due": ...
      // case "homework.assigned": ...
      
      default:
        // Unknown trigger, کچھ نہ کریں
        break;
    }
  } catch (error) {
    logger.error(`Workflow Engine: Error executing workflow for ${trigger}:`, { metadata: { error } });
    // Engine کو Crash نہیں ہونے دیا جائے گا، باقی سسٹم کام کرتا رہے گا
  }
}
