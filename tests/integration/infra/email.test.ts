import orchestrator from "@/tests/orchestrator";
import email from "@infra/email";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.ts", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "BizzNews <contato@bizznews.com.br>",
      to: "alefevt@gmail.com",
      subject: "Teste de assunto",
      text: "Corpo do primeiro email.",
    });

    await email.send({
      from: "BizzNews <contato@bizznews.com.br>",
      to: "alefevt@gmail.com",
      subject: "Teste de assunto",
      text: "Corpo do último email",
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe("<contato@bizznews.com.br>");
    expect(lastEmail.recipients[0]).toBe("<alefevt@gmail.com>");
    expect(lastEmail.subject).toBe("Teste de assunto");
    expect(lastEmail.text).toBe("Corpo do último email\r\n");
  });
});
