// ALX⁺ - Serviço Oficial de E-mails via SMTP Próprio & Automação de Lembretes VIP

import { SiteBrandConfig, SmtpConfig, VipMember } from '../types';

export interface SendEmailPayload {
  to?: string; // Use 'ADMIN' ou omita para enviar para o e-mail recebedor do Admin
  subject: string;
  html?: string;
  text: string;
  replyTo?: string;
  smtpConfig?: SmtpConfig;
  saveConfig?: boolean;
}

export interface SendEmailResult {
  success: boolean;
  method?: string;
  error?: string;
  response?: string;
}

/**
 * Monta um template HTML elegante com a identidade visual da Alx⁺
 */
export function buildAlxEmailHtml(params: {
  badge?: string;
  title: string;
  subtitle?: string;
  bodyLines: string[];
  highlightBox?: { label: string; value: string }[];
  ctaText?: string;
  ctaUrl?: string;
  footerNote?: string;
}): string {
  const {
    badge = 'PORTAL OFICIAL ALX⁺',
    title,
    subtitle,
    bodyLines,
    highlightBox,
    ctaText,
    ctaUrl,
    footerNote = 'Este é um e-mail automático enviado pelo sistema oficial Alx⁺.',
  } = params;

  const paragraphsHtml = bodyLines
    .map(
      (line) =>
        `<p style="margin: 0 0 12px 0; color: #d4d4d8; font-size: 14px; line-height: 1.6;">${line}</p>`
    )
    .join('');

  const highlightsHtml =
    highlightBox && highlightBox.length > 0
      ? `<div style="background: #14141c; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin: 20px 0;">
          ${highlightBox
            .map(
              (item) =>
                `<div style="margin-bottom: 8px; font-size: 13px; color: #e4e4e7;">
                  <strong style="color: #ebbf01;">${item.label}:</strong> ${item.value}
                </div>`
            )
            .join('')}
        </div>`
      : '';

  const ctaHtml =
    ctaText && ctaUrl
      ? `<div style="margin: 26px 0 10px 0; text-align: center;">
          <a href="${ctaUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #ebbf01; color: #000000; font-weight: 800; font-size: 13px; text-decoration: none; padding: 14px 28px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${ctaText}
          </a>
        </div>`
      : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #111116; border: 1px solid #27272a; border-radius: 18px; overflow: hidden;">
    <div style="height: 4px; background: linear-gradient(90deg, #ebbf01, #f59e0b, #ebbf01);"></div>
    <div style="padding: 28px 24px;">
      <div style="display: inline-block; padding: 4px 10px; border-radius: 6px; background: rgba(235, 191, 1, 0.15); border: 1px solid rgba(235, 191, 1, 0.35); color: #ebbf01; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px;">
        ${badge}
      </div>
      <h1 style="margin: 0 0 8px 0; color: #ffffff; font-size: 22px; font-weight: 800;">
        ${title}
      </h1>
      ${
        subtitle
          ? `<p style="margin: 0 0 20px 0; color: #a1a1aa; font-size: 13px;">${subtitle}</p>`
          : '<div style="margin-bottom: 16px;"></div>'
      }
      ${paragraphsHtml}
      ${highlightsHtml}
      ${ctaHtml}
    </div>
    <div style="padding: 16px 24px; background-color: #0c0c10; border-top: 1px solid #1f1f26; text-align: center;">
      <p style="margin: 0; color: #71717a; font-size: 11px;">
        ${footerNote}
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Resolve o e-mail recebedor administrativo configurado no site
 */
export function getAdminReceiverEmail(brand?: SiteBrandConfig): string {
  if (brand?.smtpConfig?.adminReceiverEmail?.trim()) {
    return brand.smtpConfig.adminReceiverEmail.trim();
  }
  if (brand?.vipPayment?.notificationEmail?.trim()) {
    return brand.vipPayment.notificationEmail.trim();
  }
  if (brand?.links?.email?.trim() && brand.links.email.trim() !== 'contato@alxtech.com.br') {
    return brand.links.email.trim();
  }
  return 'contact@7f.com.br';
}

/**
 * Envia um e-mail através do servidor SMTP próprio (/api/send-email.php)
 */
export async function sendSmtpEmail(
  payload: SendEmailPayload,
  brand?: SiteBrandConfig
): Promise<SendEmailResult> {
  const smtpConfig = payload.smtpConfig || brand?.smtpConfig;
  const resolvedTo =
    !payload.to || payload.to === 'ADMIN'
      ? getAdminReceiverEmail(brand)
      : payload.to.trim();

  // Também dispara para Webhook (Discord/Telegram/Zapier) caso o Admin tenha configurado
  const webhookUrl = brand?.links?.customWebhookUrl?.trim();
  if (webhookUrl && (!payload.to || payload.to === 'ADMIN')) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `📬 **${payload.subject}**\n${payload.text}`,
        subject: payload.subject,
        message: payload.text,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => null);
  }

  try {
    const res = await fetch('/api/send-email.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        action: 'send',
        to: resolvedTo,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        replyTo: payload.replyTo,
        smtpConfig,
      }),
    });

    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      return {
        success: false,
        error: 'Resposta inválida do servidor de e-mail.',
      };
    }

    const data = JSON.parse(text);
    return {
      success: Boolean(data?.success),
      method: data?.method || 'SMTP',
      error: data?.error,
      response: data?.response,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Erro de conexão com o servidor SMTP.',
    };
  }
}

/**
 * Salva as configurações SMTP diretamente no servidor (/api/send-email.php?action=save_config)
 */
export async function saveSmtpConfigOnServer(smtpConfig: SmtpConfig): Promise<boolean> {
  try {
    const res = await fetch('/api/send-email.php?action=save_config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ action: 'save_config', smtpConfig }),
    });
    const data = await res.json().catch(() => null);
    return Boolean(data?.success);
  } catch {
    return false;
  }
}

/**
 * 1. Disparo de Novo Cadastro VIP (Envia alerta completo para o Admin + Confirmação de Recebimento para o Cliente)
 */
export async function sendVipRegistrationEmails(params: {
  name: string;
  email: string;
  phone: string;
  planLabel: string;
  price: string;
  notes?: string;
  brand: SiteBrandConfig;
}): Promise<SendEmailResult> {
  const { name, email, phone, planLabel, price, notes, brand } = params;
  const adminEmail = getAdminReceiverEmail(brand);
  const nowStr = new Date().toLocaleString('pt-BR');

  const adminSubject = `👑 [Novo Cadastro VIP] ${planLabel} - ${name}`;
  const adminText = [
    `Novo pedido de adesão VIP realizado no portal Alx⁺!`,
    ``,
    `Nome: ${name}`,
    `E-mail: ${email}`,
    `WhatsApp / Tel: ${phone}`,
    `Plano: ${planLabel} (R$ ${price})`,
    `Data: ${nowStr}`,
    `Status: Aguardando Aprovação`,
    `Observações: ${notes || 'Sem observações adicionais.'}`,
  ].join('\n');

  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://alx.7f.com.br';

  const adminHtml = buildAlxEmailHtml({
    badge: 'NOVO CADASTRO VIP • AGUARDANDO APROVAÇÃO',
    title: `Novo Membro VIP: ${name}`,
    subtitle: `Cadastro realizado em ${nowStr}`,
    bodyLines: [
      `Um novo usuário acabou de preencher o formulário de adesão <strong>Alx⁺ VIP</strong> no site e aguarda sua aprovação no painel administrativo.`,
    ],
    highlightBox: [
      { label: 'Nome Completo', value: name },
      { label: 'E-mail de Acesso', value: email },
      { label: 'WhatsApp / Telefone', value: phone },
      { label: 'Modalidade / Plano', value: `${planLabel} (R$ ${price})` },
      { label: 'Status Inicial', value: 'Aguardando Aprovação' },
      { label: 'Observações', value: notes || 'Nenhuma observação informada' },
    ],
    ctaText: 'Abrir Painel Admin para Aprovar',
    ctaUrl: `${siteOrigin}/admin`,
  });

  // Envia o e-mail principal para o Administrador
  const adminResult = await sendSmtpEmail(
    {
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
      text: adminText,
      replyTo: email,
    },
    brand
  );

  // Envia também um e-mail de confirmação de pedido recebido para o Cliente (não bloqueante)
  const clientSubject = `[Alx⁺ VIP] Recebemos seu pedido de adesão VIP!`;
  const clientText = `Olá, ${name}!\n\nRecebemos seu cadastro para o plano ${planLabel} no portal Alx⁺ VIP.\nSeu pedido está em análise e assim que aprovado você receberá um novo e-mail confirmando a liberação imediata do seu acesso.\n\nEquipe Alx⁺`;
  const clientHtml = buildAlxEmailHtml({
    badge: 'PEDIDO RECEBIDO • ALX⁺ VIP',
    title: `Olá, ${name}!`,
    subtitle: 'Sua solicitação de adesão VIP foi registrada com sucesso.',
    bodyLines: [
      `Recebemos os dados do seu cadastro na <strong>Área VIP Alx⁺</strong>.`,
      `Assim que a confirmação for concluída pelo administrador, você receberá automaticamente um e-mail avisando que seu acesso está <strong>liberado e ativo</strong>!`,
    ],
    highlightBox: [
      { label: 'Seu E-mail de Login', value: email },
      { label: 'Plano Selecionado', value: `${planLabel} (R$ ${price})` },
      { label: 'Status Atual', value: 'Em Análise / Aguardando Aprovação' },
    ],
    ctaText: 'Acessar Portal Alx⁺',
    ctaUrl: `${siteOrigin}/vip`,
  });

  sendSmtpEmail(
    {
      to: email,
      subject: clientSubject,
      html: clientHtml,
      text: clientText,
      replyTo: adminEmail,
    },
    brand
  ).catch(() => null);

  return adminResult;
}

/**
 * 2. Disparo Automático ao Clicar em "Aprovar VIP" no Painel Admin
 */
export async function sendVipApprovalEmailToMember(
  member: VipMember,
  brand: SiteBrandConfig,
  expirationDateStr?: string
): Promise<SendEmailResult> {
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://alx.7f.com.br';
  const expRaw = expirationDateStr || member.expirationDate || '30 dias';
  const expFormatted = /^\d{4}-\d{2}-\d{2}$/.test(expRaw)
    ? expRaw.split('-').reverse().join('/')
    : expRaw;

  const subject = `👑 [Alx⁺ VIP] Seu Acesso VIP foi APROVADO!`;
  const text = [
    `Olá, ${member.name}!`,
    ``,
    `Temos uma ótima notícia: sua adesão ao Portal Alx⁺ VIP foi APROVADA e seu acesso já está 100% liberado!`,
    ``,
    `E-mail de Login: ${member.email}`,
    `Plano: ${member.planType} (${member.period})`,
    `Validade do Acesso: ${expFormatted}`,
    ``,
    `Acesse agora em: ${siteOrigin}/vip`,
    ``,
    `Equipe Alx⁺ VIP`,
  ].join('\n');

  const html = buildAlxEmailHtml({
    badge: 'ACESSO LIBERADO • ALX⁺ VIP',
    title: `Parabéns, ${member.name}! Seu VIP foi Aprovado!`,
    subtitle: 'Seu acesso exclusivo ao Portal Alx⁺ VIP já está ativo e liberado.',
    bodyLines: [
      `Sua solicitação foi aprovada com sucesso! Agora você já pode entrar na <strong>Área VIP Alx⁺</strong> usando seu e-mail e a senha cadastrada para baixar todos os APKs, firmwares, wallpapers e acessar os conteúdos exclusivos.`,
    ],
    highlightBox: [
      { label: 'Status da Conta', value: '✅ ATIVO E LIBERADO' },
      { label: 'Seu E-mail de Login', value: member.email },
      { label: 'Plano / Modalidade', value: `${member.planType} (${member.period})` },
      { label: 'Válido até', value: expFormatted },
    ],
    ctaText: 'Entrar na Área VIP Agora',
    ctaUrl: `${siteOrigin}/vip`,
  });

  return sendSmtpEmail(
    {
      to: member.email,
      subject,
      html,
      text,
      replyTo: getAdminReceiverEmail(brand),
    },
    brand
  );
}

/**
 * 4. Disparo ao Renovar Plano VIP (+30 dias ou Anual)
 */
export async function sendVipRenewalEmailToMember(
  member: VipMember,
  brand: SiteBrandConfig,
  newExpirationDate: string
): Promise<SendEmailResult> {
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://alx.7f.com.br';
  const expFormatted = /^\d{4}-\d{2}-\d{2}$/.test(newExpirationDate)
    ? newExpirationDate.split('-').reverse().join('/')
    : newExpirationDate;

  const subject = `👑 [Alx⁺ VIP] Plano Renovado com Sucesso!`;
  const text = [
    `Olá, ${member.name}!`,
    ``,
    `Confirmamos a renovação da sua assinatura no Portal Alx⁺ VIP!`,
    `Seu acesso foi estendido e está ativo até ${expFormatted}.`,
    ``,
    `Acesse agora em: ${siteOrigin}/vip`,
    ``,
    `Equipe Alx⁺ VIP`,
  ].join('\n');

  const html = buildAlxEmailHtml({
    badge: 'PLANO RENOVADO • ALX⁺ VIP',
    title: `Sua Assinatura VIP foi Renovada!`,
    subtitle: `Seu acesso ao Portal Alx⁺ VIP foi estendido com sucesso.`,
    bodyLines: [
      `Confirmamos a renovação do seu plano <strong>${member.planType}</strong>.`,
      `Seu acesso exclusivo já está garantido e ativo até <strong>${expFormatted}</strong>!`,
    ],
    highlightBox: [
      { label: 'Status da Conta', value: '✅ ATIVO E RENOVADO' },
      { label: 'E-mail de Login', value: member.email },
      { label: 'Nova Validade', value: expFormatted },
    ],
    ctaText: 'Acessar Área VIP',
    ctaUrl: `${siteOrigin}/vip`,
  });

  return sendSmtpEmail(
    {
      to: member.email,
      subject,
      html,
      text,
      replyTo: getAdminReceiverEmail(brand),
    },
    brand
  );
}

/**
 * 5. Disparo de Aviso de Pagamento Pendente / Falha no Cartão (Mercado Pago) com Tolerância de +2 Dias
 */
export async function sendVipPaymentFailedEmailToMember(
  member: VipMember,
  brand: SiteBrandConfig
): Promise<SendEmailResult> {
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://alx.7f.com.br';
  const subject = `⚠️ [Alx⁺ VIP] Falha na Renovação Automática / Pagamento Pendente`;
  const text = [
    `Olá, ${member.name}!`,
    ``,
    `Notamos que houve uma falha na cobrança automática do seu plano ${member.planType} no Mercado Pago.`,
    `Concedemos uma tolerância especial de 2 dias para que você possa atualizar seus dados de pagamento ou regularizar a assinatura sem perder o acesso.`,
    ``,
    `Regularize em: ${siteOrigin}/vip`,
    ``,
    `Equipe Alx⁺ VIP`,
  ].join('\n');

  const html = buildAlxEmailHtml({
    badge: 'PAGAMENTO PENDENTE • TOLERÂNCIA DE 2 DIAS',
    title: `Atenção: Falha no Pagamento do Plano VIP`,
    subtitle: `Sua assinatura automática no Mercado Pago não pôde ser processada.`,
    bodyLines: [
      `Identificamos uma pendência ou falha na cobrança do seu plano <strong>${member.planType}</strong>.`,
      `Para evitar a desativação do seu acesso, concedemos uma <strong>tolerância de 2 dias</strong>. Por favor, verifique seu cartão ou regularize sua assinatura.`,
    ],
    highlightBox: [
      { label: 'Status', value: '⚠️ PENDENTE / TOLERÂNCIA DE 2 DIAS' },
      { label: 'E-mail de Acesso', value: member.email },
      { label: 'Plano', value: member.planType },
    ],
    ctaText: 'Regularizar Assinatura VIP',
    ctaUrl: `${siteOrigin}/vip`,
  });

  return sendSmtpEmail(
    {
      to: member.email,
      subject,
      html,
      text,
      replyTo: getAdminReceiverEmail(brand),
    },
    brand
  );
}

/**
 * 3. Lembrete Automático de Vencimento (1 Dia Antes) para Membros Mensais (Envia para o Cliente e para o Admin)
 */
export async function sendVipExpirationReminderEmails(
  member: VipMember,
  brand: SiteBrandConfig
): Promise<boolean> {
  if (!member.email) return false;
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://alx.7f.com.br';
  const adminEmail = getAdminReceiverEmail(brand);
  const expFormatted = /^\d{4}-\d{2}-\d{2}$/.test(member.expirationDate)
    ? member.expirationDate.split('-').reverse().join('/')
    : member.expirationDate;

  // 3a. E-mail para o Cliente
  const clientSubject = `⏰ [Alx⁺ VIP] Sua assinatura vence amanhã (${expFormatted})`;
  const clientText = [
    `Olá, ${member.name}!`,
    ``,
    `Passando para lembrar que sua assinatura no Portal Alx⁺ VIP (${member.planType}) vence amanhã, dia ${expFormatted}.`,
    `Para continuar com acesso ininterrupto a todos os APKs, atualizações e conteúdos exclusivos, realize a renovação na Área VIP do portal.`,
    ``,
    `Renove em: ${siteOrigin}/vip`,
    ``,
    `Equipe Alx⁺ VIP`,
  ].join('\n');

  const clientHtml = buildAlxEmailHtml({
    badge: 'LEMBRETE DE RENOVAÇÃO • ALX⁺ VIP',
    title: `Olá, ${member.name}! Seu acesso VIP vence amanhã.`,
    subtitle: `Lembrete automático de vencimento programado para ${expFormatted}.`,
    bodyLines: [
      `Sua assinatura no <strong>Portal Alx⁺ VIP</strong> está programada para vencer amanhã (<strong>${expFormatted}</strong>).`,
      `Para continuar aproveitando todos os aplicativos exclusivos, atualizações e benefícios sem interrupção, acesse o portal para renovar sua adesão.`,
    ],
    highlightBox: [
      { label: 'Membro', value: member.name },
      { label: 'E-mail', value: member.email },
      { label: 'Plano Atual', value: `${member.planType} (${member.period})` },
      { label: 'Data de Vencimento', value: expFormatted },
    ],
    ctaText: 'Renovar Meu Acesso VIP',
    ctaUrl: `${siteOrigin}/vip`,
  });

  const clientRes = await sendSmtpEmail(
    {
      to: member.email,
      subject: clientSubject,
      html: clientHtml,
      text: clientText,
      replyTo: adminEmail,
    },
    brand
  );

  // 3b. E-mail de alerta para o Administrador
  const adminSubject = `🔔 [Aviso Admin] Membro VIP vence amanhã (${expFormatted}): ${member.name}`;
  const adminText = [
    `Aviso Automático de Vencimento VIP (1 dia antes):`,
    ``,
    `O membro abaixo vence amanhã (${expFormatted}) e já recebeu o lembrete automático por e-mail:`,
    `Nome: ${member.name}`,
    `E-mail: ${member.email}`,
    `WhatsApp: ${member.phone || 'Não informado'}`,
    `Plano: ${member.planType} (${member.period})`,
    `Vencimento: ${expFormatted}`,
  ].join('\n');

  const adminHtml = buildAlxEmailHtml({
    badge: 'AVISO AUTOMÁTICO AO ADMIN • VENCIMENTO AMANHÃ',
    title: `Membro VIP Vencendo Amanhã: ${member.name}`,
    subtitle: `O sistema já disparou o e-mail automático de lembrete para o cliente.`,
    bodyLines: [
      `O membro VIP abaixo está a <strong>1 dia do vencimento</strong>. Um e-mail automático de lembrete de renovação já foi enviado para <strong>${member.email}</strong>.`,
    ],
    highlightBox: [
      { label: 'Nome do Membro', value: member.name },
      { label: 'E-mail', value: member.email },
      { label: 'WhatsApp', value: member.phone || 'Não informado' },
      { label: 'Plano / Período', value: `${member.planType} (${member.period})` },
      { label: 'Data de Vencimento', value: expFormatted },
    ],
    ctaText: 'Gerenciar Membros no Painel',
    ctaUrl: `${siteOrigin}/admin`,
  });

  await sendSmtpEmail(
    {
      to: adminEmail,
      subject: adminSubject,
      html: adminHtml,
      text: adminText,
      replyTo: member.email,
    },
    brand
  );

  return clientRes.success;
}

/**
 * Calcula a data de amanhã no fuso America/Sao_Paulo no formato YYYY-MM-DD
 */
export function getTomorrowDateKey(): string {
  try {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(tomorrow);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch {}
  const t = new Date(Date.now() + 86400000);
  return t.toISOString().slice(0, 10);
}
