import React, { useState, useEffect, useRef } from 'react';
import { I } from '../icons.jsx';
import JiraMonitor from '../components/JiraMonitor.jsx';
import AlertaCard from '../components/AlertaCard.jsx';
import ColetaWidget from '../components/ColetaWidget.jsx';

function HomeScreen({ setRoute }) {
  const ferramentas = [
    { key: 'inicio',      available: true  },
    { key: 'eventos',     available: true  },
    { key: 'contrato',    available: false },
    { key: 'followup',    available: false },
    { key: 'slack',       available: true  },
    { key: 'briefing',    available: false },
    { key: 'concorrente', available: false },
  ];
  const total = ferramentas.length;
  const disponiveis = ferramentas.filter(f => f.available).length;
  return (
    <main className="main">
      <div className="page-header">
        <div className="page-eyebrow">
          <span className="dot" />
          Painel Comercial
          <span style={{ color: "var(--md-muted-2)" }}>·</span>
          {(()=>{const hoje=new Date();const dias=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];const meses=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];return `${dias[hoje.getDay()]}, ${hoje.getDate()} de ${meses[hoje.getMonth()]}`;})()}
        </div>
        <div className="page-title-row">
          <div>
            <h1 className="page-title">
              {(()=>{const h=new Date().getHours();const nomeVendedor=localStorage.getItem('vendedor_nome');const primeiroNome=nomeVendedor?nomeVendedor.split(' ')[0]:'vendedor(a)';return h>=5&&h<12?`Bom dia, ${primeiroNome}`:h>=12&&h<18?`Boa tarde, ${primeiroNome}`:`Boa noite, ${primeiroNome}`;})()}<span className="accent-bar" />
            </h1>
            <p className="page-subtitle">
              {(()=>{const h=new Date().getHours();return h>=5&&h<12?'Bom dia de vendas. O que vai fechar hoje?':h>=12&&h<18?'Hub de Vendas Mandaê / Nuvem Envio. Ferramentas, eventos e inteligência.':'Encerrando o dia? Registre seus follow-ups antes de sair.';})()} 
            </p>
          </div>
          <div className="page-meta">
            <span className="meta-pill"><span className="led" /> {disponiveis} de {total} disponível</span>
          </div>
        </div>
      </div>

      <div className="bento">
        {/* Featured */}
        <div className="tool-card available" onClick={() => setRoute("inicio")}>
          <div className="tool-card-head">
            <div className="tool-icon">{I.chat}</div>
            <span className="badge available">Disponível</span>
          </div>
          <h3 className="tool-name">Boas-vindas ao Cliente</h3>
          <p className="tool-desc">
            Gera a mensagem de boas-vindas para o grupo do WhatsApp do novo cliente a partir da ficha cadastral. Pronto em segundos.
          </p>
          <div className="tool-foot">
            <span className="tool-cta">
              Abrir ferramenta {I.arrowRight}
            </span>
          </div>
        </div>

        {/* Agenda de Eventos */}
        <div className="tool-card available" onClick={() => setRoute("eventos")}>
          <div className="tool-card-head">
            <div className="tool-icon">{I.stars}</div>
            <span className="badge available">Disponível</span>
          </div>
          <h3 className="tool-name">Agenda de Eventos</h3>
          <p className="tool-desc">Calendário Nuvem Envio 2026 + Conecta D2C.</p>
          <div className="tool-foot">
            <span className="tool-cta">Ver agenda {I.arrowRight}</span>
          </div>
        </div>

        {/* Solicitar Horario de Coleta */}
        <div className="tool-card coming-soon">
          <div className="tool-card-head">
            <div className="tool-icon">{I.chat}</div>
            <span className="badge coming-soon">Em breve</span>
          </div>
          <h3 className="tool-name">Gerador de Follow-up</h3>
          <p className="tool-desc">Mensagens de follow-up prontas por momento, canal e tom. Sem clichês, com CTA claro.</p>
          <div className="tool-foot">
            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>
          </div>
        </div>

        {/* Aprovação Interna */}
        <div className="tool-card available" onClick={()=>setRoute("slack")}>
          <div className="tool-card-head">
            <div className="tool-icon">{I.paperPlane}</div>
            <span className="badge available">Disponível</span>
          </div>
          <h3 className="tool-name">Aprovação Interna</h3>
          <p className="tool-desc">Gera a mensagem de pedido de aprovação para o Slack. Formato padronizado, direto, sem rodeios.</p>
          <div className="tool-foot">
            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>
          </div>
        </div>

        {/* Briefing de Reunião — wide */}
        <div className="tool-card coming-soon">
          <div className="tool-card-head">
            <div className="tool-icon">{I.stars}</div>
            <span className="badge coming-soon">Em breve</span>
          </div>
          <h3 className="tool-name">Solicitar Horário de Coleta</h3>
          <p className="tool-desc">Solicite uma nova janela de coleta direto pelo Kit, sem abrir o portal. 1 clique.</p>
          <div className="tool-foot"><span className="tool-cta">Em breve</span></div>
        </div>

        {/* Auxiliar de Contrato */}
        <div className="tool-card coming-soon">
          <div className="tool-card-head">
            <div className="tool-icon">{I.invoice}</div>
            <span className="badge coming-soon">Em breve</span>
          </div>
          <h3 className="tool-name">Auxiliar de Contrato</h3>
          <p className="tool-desc">Analisa contratos comentados pelo jurídico do cliente. Semáforo de risco por cláusula + rascunho de e-mail de retorno.</p>
          <div className="tool-foot">
            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>
          </div>
        </div>

        {/* Gerador de Follow-up */}
        <div className="tool-card coming-soon span-2">
          <div className="tool-card-head">
            <div className="tool-icon">{I.stats}</div>
            <span className="badge coming-soon">Em breve</span>
          </div>
          <h3 className="tool-name">Briefing de Reunião</h3>
          <p className="tool-desc">Prepare-se antes da call. Perguntas, talking points, objeções esperadas e próximo passo ideal.</p>
          <div className="tool-foot">
            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>
          </div>
        </div>

        {/* Análise de Concorrente — wide */}
        <div className="tool-card coming-soon span-2">
          <div className="tool-card-head">
            <div className="tool-icon">{I.lock}</div>
            <span className="badge coming-soon">Em breve</span>
          </div>
          <h3 className="tool-name">Análise de Concorrente</h3>
          <p className="tool-desc">Cliente mencionou um concorrente? Receba diferenciação específica e pronta para usar na hora.</p>
          <div className="tool-foot">
            <span className="tool-cta">Abrir ferramenta {I.arrowRight}</span>
          </div>
        </div>
      </div>


      <div style={{ marginTop: 36 }}>
        <div className="alertas-row"><JiraMonitor /><AlertaCard /></div>
        <ColetaWidget />
      </div>
    </main>
  );
}


export default HomeScreen;
