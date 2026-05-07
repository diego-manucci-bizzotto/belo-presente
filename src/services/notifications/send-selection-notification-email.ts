import { SelectionEventType } from "@/daos/list-selection-event-dao";
import { UserDAO } from "@/daos/user-dao";
import { sendEmail } from "@/lib/nodemailer/nodemailer";

type SendSelectionNotificationEmailInput = {
  userId: string;
  listId: string;
  listTitle: string;
  productName: string;
  guestName: string;
  eventType: SelectionEventType;
};

const EVENT_LABELS: Record<SelectionEventType, string> = {
  selected: "selecionou",
  deselected: "desmarcou",
};

export const sendSelectionNotificationEmail = async ({
  userId,
  listId,
  listTitle,
  productName,
  guestName,
  eventType,
}: SendSelectionNotificationEmailInput) => {
  try {
    const user = await UserDAO.getUserById(userId);
    if (!user?.email) {
      return false;
    }

    const actionLabel = EVENT_LABELS[eventType];

    await sendEmail({
      to: String(user.email),
      subject: `Atualizacao na lista "${listTitle}"`,
      text:
        `${guestName} ${actionLabel} o produto "${productName}" na sua lista "${listTitle}". ` +
        `Acompanhe o historico em /lists/${listId}/notifications.`,
      html:
        `<p><strong>${guestName}</strong> ${actionLabel} o produto <strong>${productName}</strong> ` +
        `na sua lista <strong>${listTitle}</strong>.</p>` +
        `<p>Veja o historico em <code>/lists/${listId}/notifications</code>.</p>`,
    });

    return true;
  } catch {
    return false;
  }
};

