import nodemailer from "nodemailer";

export class NodeMailer {
  private static initTransport() {
    const transport = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "13d5070cdc74c4",
        pass: "a9bd285b32c208",
      },
    });
    return transport;
  }

  static sendMail(data: { to: string[]; subject: string; html: string }) {
    return NodeMailer.initTransport().sendMail({
      from: "test@gmail.com",
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  }
}
