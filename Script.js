// ============================
// ⚡ CONFIGURAÇÕES PRINCIPAIS
// ============================

const CONFIG = {
    ANO_ATUAL: 2025,
    DIAS_POR_SEMANA: 5,
    INICIO_CURSO: '2025-01-01',
    PREVISAO_TERMINO: '2026-02-12',
    HORAS_CURSO: 1200,
    HORAS_POR_DIA: 4,
    IMPACTO_POR_FALTA: 0.25,
    DATA_INICIO_NOVEMBRO: '2025-11-03'
};

// ============================
// 🗃️ ESTADO GLOBAL DO SISTEMA
// ============================

const State = {
    meses: [
        { nome: 'Janeiro', dias: 15, concluidos: 0, editando: false },
        { nome: 'Fevereiro', dias: 9, concluidos: 0, editando: false },
        { nome: 'Março', dias: 0, concluidos: 0, editando: false },
        { nome: 'Abril', dias: 0, concluidos: 0, editando: false },
        { nome: 'Maio', dias: 0, concluidos: 0, editando: false },
        { nome: 'Junho', dias: 0, concluidos: 0, editando: false },
        { nome: 'Julho', dias: 0, concluidos: 0, editando: false },
        { nome: 'Agosto', dias: 0, concluidos: 0, editando: false },
        { nome: 'Setembro', dias: 0, concluidos: 0, editando: false },
        { nome: 'Outubro', dias: 4, concluidos: 0, editando: false },
        { nome: 'Novembro', dias: 17, concluidos: 0, editando: false },
        { nome: 'Dezembro', dias: 10, concluidos: 0, editando: false }
    ],
    
    presenca: {
        frequencia: 81.91,
        totalFaltasHoras: 217.00,
        situacao: 'Em Progresso'
    },
    
    config: { ...CONFIG },
    
    cache: {
        totalDias: 0,
        diasConcluidos: 0,
        ultimaAtualizacao: null
    }
};

// ============================
// 🧠 SISTEMA INTELIGENTE DE CACHE
// ============================

const CacheManager = {
    calcularTotais() {
        State.cache.totalDias = State.meses.reduce((total, mes) => total + mes.dias, 0);
        State.cache.diasConcluidos = State.meses.reduce((total, mes) => total + mes.concluidos, 0);
        State.cache.ultimaAtualizacao = new Date();
    },
    
    getTotalDias() {
        return State.cache.totalDias;
    },
    
    getDiasConcluidos() {
        return State.cache.diasConcluidos;
    },
    
    getDiasRestantes() {
        return State.cache.totalDias - State.cache.diasConcluidos;
    },
    
    getPercentual() {
        return State.cache.totalDias > 0 ? 
            Math.round((State.cache.diasConcluidos / State.cache.totalDias) * 100) : 0;
    }
};

// ============================
// 💾 SISTEMA AVANÇADO DE ARMAZENAMENTO
// ============================

const StorageManager = {
    CHAVE: 'gestorDiasLetivos2025_ultra',
    
    salvar() {
        const dados = {
            meses: State.meses,
            config: State.config,
            presenca: State.presenca,
            metadata: {
                versao: '2.0',
                ultimaAtualizacao: new Date().toISOString(),
                hash: this.gerarHash()
            }
        };
        
        try {
            localStorage.setItem(this.CHAVE, JSON.stringify(dados));
            return true;
        } catch (e) {
            console.error('Erro ao salvar:', e);
            return false;
        }
    },
    
    carregar() {
        try {
            const dadosSalvos = localStorage.getItem(this.CHAVE);
            if (!dadosSalvos) return false;
            
            const dados = JSON.parse(dadosSalvos);
            
            // Migração de versões antigas
            if (!dados.metadata || dados.metadata.versao !== '2.0') {
                this.migrarDados(dados);
                return true;
            }
            
            Object.assign(State.meses, dados.meses);
            Object.assign(State.config, dados.config);
            Object.assign(State.presenca, dados.presenca);
            
            return true;
        } catch (e) {
            console.error('Erro ao carregar:', e);
            return false;
        }
    },
    
    migrarDados(dadosAntigos) {
        // Lógica de migração de versões anteriores
        if (dadosAntigos.meses) State.meses = dadosAntigos.meses;
        if (dadosAntigos.config) State.config = dadosAntigos.config;
        if (dadosAntigos.presenca) State.presenca = dadosAntigos.presenca;
        
        this.salvar();
    },
    
    gerarHash() {
        return btoa(JSON.stringify(State.meses) + JSON.stringify(State.config)).slice(0, 16);
    },
    
    exportar() {
        CacheManager.calcularTotais();
        
        const dadosExportacao = {
            progresso: {
                totalDias: CacheManager.getTotalDias(),
                diasConcluidos: CacheManager.getDiasConcluidos(),
                diasRestantes: CacheManager.getDiasRestantes(),
                percentual: CacheManager.getPercentual() + '%'
            },
            presenca: { ...State.presenca },
            horas: {
                totais: State.config.HORAS_CURSO,
                concluidas: CacheManager.getDiasConcluidos() * State.config.HORAS_POR_DIA,
                restantes: State.config.HORAS_CURSO - (CacheManager.getDiasConcluidos() * State.config.HORAS_POR_DIA)
            },
            estatisticas: this.calcularEstatisticasAvancadas(),
            meses: State.meses.filter(mes => mes.dias > 0),
            config: State.config,
            exportadoEm: new Date().toISOString(),
            versao: '2.0'
        };

        const blob = new Blob([JSON.stringify(dadosExportacao, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gestor-curso-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        return true;
    },
    
    calcularEstatisticasAvancadas() {
        const hoje = new Date();
        const inicio = new Date(State.config.INICIO_CURSO);
        const diasPassados = Math.max(1, Math.floor((hoje - inicio) / (1000 * 60 * 60 * 24)));
        
        return {
            eficiencia: Math.round((CacheManager.getDiasConcluidos() / diasPassados) * 100),
            ritmoAtual: ((CacheManager.getDiasConcluidos() / diasPassados) * 7).toFixed(1),
            semanasRestantes: Math.ceil(
                (State.config.HORAS_CURSO - (CacheManager.getDiasConcluidos() * State.config.HORAS_POR_DIA)) / 
                (State.config.HORAS_POR_DIA * State.config.DIAS_POR_SEMANA)
            ),
            previsaoTermino: '12/02/2026'
        };
    }
};

// ============================
// 📅 SISTEMA INTELIGENTE DE CALENDÁRIO
// ============================

const CalendarEngine = {
    calcularDiasUteisPeriodo(dataInicio, dataFim) {
        let diasUteis = 0;
        const data = new Date(dataInicio);
        
        while (data <= dataFim) {
            const diaSemana = data.getDay();
            if (diaSemana >= 1 && diaSemana <= 5) {
                diasUteis++;
            }
            data.setDate(data.getDate() + 1);
        }
        
        return diasUteis;
    },
    
    calcularProgressoAutomatico() {
        const hoje = new Date();
        if (hoje.getFullYear() !== State.config.ANO_ATUAL) return;
        
        const novembro = State.meses[10];
        if (novembro && novembro.nome === 'Novembro') {
            const diasConcluidos = this.calcularDiasUteisPeriodo(
                new Date(State.config.DATA_INICIO_NOVEMBRO),
                hoje
            );
            
            if (diasConcluidos > novembro.concluidos) {
                novembro.concluidos = Math.min(diasConcluidos, novembro.dias);
            }
        }
    },
    
    calcularDiasRestantes2025() {
        const hoje = new Date();
        if (hoje.getFullYear() !== State.config.ANO_ATUAL) return 0;
        
        const novembro = State.meses[10];
        const dezembro = State.meses[11];
        
        return Math.max(0, novembro.dias - novembro.concluidos) + 
               Math.max(0, dezembro.dias - dezembro.concluidos);
    },
    
    getMesAtual() {
        return new Date().getMonth();
    },
    
    isValidDate(date) {
        return date instanceof Date && !isNaN(date);
    }
};

// ============================
// 🎯 SISTEMA DE AÇÕES INTELIGENTES
// ============================

const ActionManager = {
    concluirDiaAtual() {
        const mesAtual = CalendarEngine.getMesAtual();
        const mes = State.meses[mesAtual];
        
        if (!mes || mes.concluidos >= mes.dias) {
            NotificationSystem.show('Todos os dias deste mês já foram concluídos!', 'warning');
            return false;
        }
        
        mes.concluidos++;
        this.animarConclusao(event);
        Sistema.atualizarTudo();
        NotificationSystem.show('Dia concluído com sucesso!', 'success');
        return true;
    },
    
    adicionarDias(quantidade = 1) {
        let diasRestantes = parseInt(quantidade) || 1;
        let diasAdicionados = 0;
        
        for (let mes of State.meses) {
            if (diasRestantes <= 0) break;
            
            const disponivel = mes.dias - mes.concluidos;
            const adicionar = Math.min(disponivel, diasRestantes);
            
            if (adicionar > 0) {
                mes.concluidos += adicionar;
                diasRestantes -= adicionar;
                diasAdicionados += adicionar;
            }
        }
        
        if (diasRestantes > 0) {
            NotificationSystem.show(
                `Atenção: ${diasRestantes} dias não puderam ser adicionados (limite atingido)`, 
                'warning'
            );
        }
        
        if (diasAdicionados > 0) {
            Sistema.atualizarTudo();
            NotificationSystem.show(`${diasAdicionados} dias adicionados com sucesso!`, 'success');
        }
        
        return diasAdicionados;
    },
    
    ajustarManual() {
        const totalAtual = CacheManager.getDiasConcluidos();
        const totalDias = CacheManager.getTotalDias();
        
        const totalDesejado = prompt(
            `Digite o total de dias concluídos desejado (máximo: ${totalDias}):`, 
            totalAtual
        );
        
        if (totalDesejado === null) return;
        
        const valor = parseInt(totalDesejado);
        if (isNaN(valor) || valor < 0 || valor > totalDias) {
            NotificationSystem.show('Valor inválido!', 'danger');
            return;
        }
        
        this.ajustarProgressoPara(valor);
        Sistema.atualizarTudo();
        NotificationSystem.show(`Progresso ajustado para ${valor} dias!`, 'success');
    },
    
    ajustarProgressoPara(valorDesejado) {
        const diferenca = valorDesejado - CacheManager.getDiasConcluidos();
        
        if (diferenca > 0) {
            this.adicionarDias(diferenca);
        } else {
            this.removerDias(Math.abs(diferenca));
        }
    },
    
    removerDias(quantidade) {
        let diasRemover = quantidade;
        
        for (let i = State.meses.length - 1; i >= 0 && diasRemover > 0; i--) {
            const mes = State.meses[i];
            const remover = Math.min(mes.concluidos, diasRemover);
            
            if (remover > 0) {
                mes.concluidos -= remover;
                diasRemover -= remover;
            }
        }
    },
    
    animarConclusao(event) {
        const btn = event?.target?.closest('button');
        if (btn) {
            btn.classList.add('celebrate');
            setTimeout(() => btn.classList.remove('celebrate'), 500);
        }
    }
};

// ============================
// ⚙️ SISTEMA DE CONFIGURAÇÕES
// ============================

const ConfigManager = {
    atualizarInterface() {
        const elements = {
            'config-horas-total': State.config.HORAS_CURSO,
            'config-horas-dia': State.config.HORAS_POR_DIA,
            'config-dias-semana': State.config.DIAS_POR_SEMANA,
            'config-impacto-falta': State.config.IMPACTO_POR_FALTA
        };
        
        for (const [id, valor] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) element.value = valor;
        }
    },
    
    atualizarConfiguracoes() {
        const novosValores = {
            HORAS_CURSO: parseInt(document.getElementById('config-horas-total').value) || 1200,
            HORAS_POR_DIA: parseInt(document.getElementById('config-horas-dia').value) || 4,
            DIAS_POR_SEMANA: parseInt(document.getElementById('config-dias-semana').value) || 5,
            IMPACTO_POR_FALTA: parseFloat(document.getElementById('config-impacto-falta').value) || 0.25
        };
        
        Object.assign(State.config, novosValores);
        Sistema.atualizarTudo();
        NotificationSystem.show('Configurações atualizadas com sucesso!', 'success');
    }
};

// ============================
// 📊 SISTEMA DE PRESENÇA AVANÇADO
// ============================

const PresencaManager = {
    adicionarFalta(horas = 4) {
        const horasFalta = parseFloat(horas) || 4;
        
        State.presenca.totalFaltasHoras += horasFalta;
        State.presenca.frequencia = Math.max(0, 
            ((State.config.HORAS_CURSO - State.presenca.totalFaltasHoras) / State.config.HORAS_CURSO) * 100
        );
        
        State.presenca.situacao = State.presenca.frequencia < 75 ? 
            'Atenção: Frequência Baixa' : 'Em Progresso';
        
        Sistema.atualizarTudo();
        NotificationSystem.show(
            `${horasFalta}h de falta registrada! Frequência: ${State.presenca.frequencia.toFixed(2)}%`, 
            'warning'
        );
    },
    
    reiniciarFaltas() {
        if (!confirm('Tem certeza que deseja reiniciar todas as faltas?')) return;
        
        State.presenca.frequencia = 81.91;
        State.presenca.totalFaltasHoras = 217.00;
        State.presenca.situacao = 'Em Progresso';
        
        Sistema.atualizarTudo();
        NotificationSystem.show('Faltas reiniciadas com sucesso!', 'success');
    },
    
    getStatusFrequencia() {
        if (State.presenca.frequencia >= 80) {
            return { texto: 'Boa', detalhe: 'Frequência adequada', classe: '' };
        } else if (State.presenca.frequencia >= 75) {
            return { texto: 'Atenção', detalhe: 'Frequência próxima do limite', classe: 'danger' };
        } else {
            return { texto: 'Crítico', detalhe: 'Frequência abaixo do mínimo', classe: 'danger' };
        }
    },
    
    getClasseSituacao() {
        if (State.presenca.frequencia >= 80) return 'situacao-em-progresso';
        if (State.presenca.frequencia >= 75) return 'situacao-atencao';
        return 'situacao-perigo';
    }
};

// ============================
// 🎨 SISTEMA DE RENDERIZAÇÃO
// ============================

const RenderEngine = {
    renderizarMeses() {
        const grid = document.getElementById('months-grid');
        if (!grid) return;
        
        grid.innerHTML = State.meses.map((mes, index) => this.criarCardMes(mes, index)).join('');
    },
    
    criarCardMes(mes, index) {
        const percentual = mes.dias > 0 ? Math.round((mes.concluidos / mes.dias) * 100) : 0;
        
        return `
            <div class="month-card ${mes.editando ? 'editing' : ''}">
                <div class="month-name">${mes.nome}</div>
                ${mes.editando ? 
                    `<input type="number" class="month-days-input" value="${mes.dias}" 
                            min="0" max="31" onchange="Sistema.atualizarDiasMes(${index}, this.value)">` :
                    `<div class="month-days">${mes.dias}</div>`
                }
                <div class="month-label">dias letivos</div>
                
                <div class="month-progress">
                    <div class="month-progress-info">
                        <span>Progresso:</span>
                        <span>${mes.concluidos}/${mes.dias} (${percentual}%)</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentual}%"></div>
                    </div>
                </div>
                
                <div class="month-actions">
                    <button class="btn btn-sm ${mes.editando ? 'btn-success' : 'btn-outline'}" 
                            onclick="Sistema.toggleEditarMes(${index})">
                        <i class="fas fa-${mes.editando ? 'check' : 'edit'}"></i>
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="Sistema.zerarMes(${index})">
                        <i class="fas fa-eraser"></i>
                    </button>
                </div>
            </div>
        `;
    },
    
    renderizarTabelaDetalhes() {
        const tbody = document.getElementById('tabela-detalhes');
        if (!tbody) return;
        
        tbody.innerHTML = State.meses
            .filter(mes => mes.dias > 0)
            .map(mes => this.criarLinhaTabela(mes))
            .join('');
    },
    
    criarLinhaTabela(mes) {
        const restantes = mes.dias - mes.concluidos;
        const percentual = Math.round((mes.concluidos / mes.dias) * 100);
        const horasConcluidas = mes.concluidos * State.config.HORAS_POR_DIA;
        
        let statusClass, statusTexto;
        
        if (percentual === 100) {
            statusClass = 'status-concluido';
            statusTexto = 'Concluído';
        } else if (percentual > 0) {
            statusClass = 'status-andamento';
            statusTexto = 'Em andamento';
        } else {
            statusClass = 'status-inativo';
            statusTexto = 'Não iniciado';
        }
        
        return `
            <tr>
                <td>${mes.nome}</td>
                <td>${mes.dias}</td>
                <td>${mes.concluidos}</td>
                <td>${restantes}</td>
                <td>
                    <div class="progress-bar-mini">
                        <div class="progress-fill-mini" style="width: ${percentual}%;"></div>
                        <span>${percentual}%</span>
                    </div>
                </td>
                <td>${horasConcluidas}h</td>
                <td><span class="${statusClass}">${statusTexto}</span></td>
            </tr>
        `;
    },
    
    atualizarInterfacePrincipal() {
        CacheManager.calcularTotais();
        
        // Atualizar progresso geral
        document.getElementById('total-dias').textContent = CacheManager.getTotalDias();
        document.getElementById('dias-concluidos').textContent = CacheManager.getDiasConcluidos();
        document.getElementById('dias-restantes').textContent = CacheManager.getDiasRestantes();
        document.getElementById('dias-2025').textContent = CalendarEngine.calcularDiasRestantes2025();
        
        const percentual = CacheManager.getPercentual();
        document.getElementById('progress-fill').style.width = `${percentual}%`;
        document.getElementById('progress-text').textContent = `${percentual}%`;
        document.getElementById('progress-percent').textContent = `${percentual}%`;
        
        // Atualizar horas
        const horasConcluidas = CacheManager.getDiasConcluidos() * State.config.HORAS_POR_DIA;
        const horasRestantes = State.config.HORAS_CURSO - horasConcluidas;
        
        document.getElementById('horas-concluidas').textContent = horasConcluidas;
        document.getElementById('horas-restantes').textContent = horasRestantes;
        
        // Atualizar presença
        document.getElementById('frequencia-curso').textContent = `${State.presenca.frequencia.toFixed(2)}%`;
        document.getElementById('total-faltas').textContent = `${State.presenca.totalFaltasHoras.toFixed(2)}h`;
        document.getElementById('horas-curso').textContent = State.config.HORAS_CURSO;
        document.getElementById('situacao-curso').textContent = `Situação do Curso: ${State.presenca.situacao}`;
        document.getElementById('situacao-curso').className = `situacao-curso ${PresencaManager.getClasseSituacao()}`;
        
        // Atualizar estatísticas
        const estatisticas = StorageManager.calcularEstatisticasAvancadas();
        document.getElementById('previsao-termino').textContent = estatisticas.previsaoTermino;
        document.getElementById('eficiencia').textContent = `${estatisticas.eficiencia}%`;
        document.getElementById('ritmo-atual').textContent = estatisticas.ritmoAtual;
        document.getElementById('semanas-restantes').textContent = estatisticas.semanasRestantes;
        
        // Atualizar status de frequência
        const statusFreq = PresencaManager.getStatusFrequencia();
        document.getElementById('status-frequencia').textContent = statusFreq.texto;
        document.getElementById('detalhe-frequencia').textContent = statusFreq.detalhe;
        document.getElementById('card-alerta').className = `result-card ${statusFreq.classe}`;
    }
};

// ============================
// 💫 SISTEMA DE NOTIFICAÇÕES
// ============================

const NotificationSystem = {
    show(mensagem, tipo = 'info') {
        const cores = {
            success: '#4CAF50',
            warning: '#FF9800',
            danger: '#FF3B30',
            info: '#2E86AB'
        };

        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerHTML = `
            <div class="notification-content ${tipo}">
                <i class="fas fa-${this.getIcon(tipo)}"></i>
                <span>${mensagem}</span>
            </div>
        `;
        
        Object.assign(notif.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: cores[tipo] || cores.info,
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '9999',
            animation: 'slideInRight 0.3s ease'
        });

        document.body.appendChild(notif);
        
        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transition = 'opacity 0.5s ease';
            setTimeout(() => notif.remove(), 500);
        }, 3000);
    },
    
    getIcon(tipo) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            danger: 'times-circle',
            info: 'info-circle'
        };
        return icons[tipo] || 'info-circle';
    }
};

// ============================
// 🎮 SISTEMA PRINCIPAL
// ============================

const Sistema = {
    inicializar() {
        StorageManager.carregar();
        CalendarEngine.calcularProgressoAutomatico();
        ConfigManager.atualizarInterface();
        this.atualizarTudo();
        
        console.log('🚀 Gestor de Dias Letivos 2025 - Sistema Inicializado!');
    },
    
    atualizarTudo() {
        CacheManager.calcularTotais();
        RenderEngine.atualizarInterfacePrincipal();
        RenderEngine.renderizarMeses();
        RenderEngine.renderizarTabelaDetalhes();
        StorageManager.salvar();
    },
    
    // Métodos públicos para interface
    toggleEditarMes(index) {
        State.meses[index].editando = !State.meses[index].editando;
        RenderEngine.renderizarMeses();
        if (!State.meses[index].editando) {
            this.atualizarTudo();
        }
    },
    
    toggleEditAll() {
        const todosEditando = State.meses.every(mes => mes.editando);
        State.meses.forEach(mes => mes.editando = !todosEditando);
        RenderEngine.renderizarMeses();
    },
    
    atualizarDiasMes(index, valor) {
        State.meses[index].dias = parseInt(valor) || 0;
        if (State.meses[index].concluidos > State.meses[index].dias) {
            State.meses[index].concluidos = State.meses[index].dias;
        }
        this.atualizarTudo();
    },
    
    zerarMes(index) {
        State.meses[index].concluidos = 0;
        this.atualizarTudo();
    },
    
    reiniciarProgresso() {
        if (!confirm('Tem certeza que deseja reiniciar TODO o progresso?')) return;
        
        State.meses.forEach(mes => mes.concluidos = 0);
        State.presenca.frequencia = 81.91;
        State.presenca.totalFaltasHoras = 217.00;
        State.presenca.situacao = 'Em Progresso';
        
        this.atualizarTudo();
        NotificationSystem.show('Progresso reiniciado com sucesso!', 'success');
    }
};

// ============================
// 🔗 INTERFACE COM HTML
// ============================

// Funções globais para o HTML
function concluirDiaAtual() { ActionManager.concluirDiaAtual(); }
function adicionarDias() { 
    const input = document.getElementById('dias-adicionais');
    ActionManager.adicionarDias(input?.value || 1); 
}
function ajustarManual() { ActionManager.ajustarManual(); }
function adicionarFalta() { 
    const input = document.getElementById('horas-falta');
    PresencaManager.adicionarFalta(input?.value || 4); 
}
function reiniciarFaltas() { PresencaManager.reiniciarFaltas(); }
function reiniciarProgresso() { Sistema.reiniciarProgresso(); }
function salvarConfiguracoes() { 
    ConfigManager.atualizarConfiguracoes(); 
    NotificationSystem.show('Configurações salvas com sucesso!', 'success');
}
function exportarDados() { 
    StorageManager.exportar(); 
    NotificationSystem.show('Dados exportados com sucesso!', 'success');
}
function atualizarConfiguracoes() { ConfigManager.atualizarConfiguracoes(); }
function toggleEditAll() { Sistema.toggleEditAll(); }

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    Sistema.inicializar();
});

// ============================
// 🎉 SISTEMA OTIMIZADO - PRONTO!
// ============================

// === SISTEMA DE EVENTOS COMPARTILHADOS ===
let calendarIntegration = {
    // Ouvir mudanças do calendário
    init: function() {
        // Monitorar mudanças no localStorage (comunicação entre abas/iframes)
        window.addEventListener('storage', function(e) {
            if (e.key === 'calendarEvents' || e.key === 'invalidatedDays') {
                calendarIntegration.handleCalendarUpdate();
            }
        });
        
        // Também monitorar via postMessage para comunicação direta
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'CALENDAR_UPDATE') {
                calendarIntegration.handleCalendarUpdate();
            }
        });
    },
    
    handleCalendarUpdate: function() {
        console.log('Calendário atualizado - sincronizando com gestor...');
        
        // Recarregar dados do calendário
        const updatedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '{}');
        const updatedInvalidatedDays = JSON.parse(localStorage.getItem('invalidatedDays') || '[]');
        
        // Atualizar a contagem de dias no gestor
        updateDayCountFromCalendar(updatedInvalidatedDays);
        
        // Atualizar eventos no gestor
        updateEventsFromCalendar(updatedEvents);
        
        // Disparar evento customizado para outros componentes do gestor
        window.dispatchEvent(new CustomEvent('gestorCalendarUpdate', {
            detail: {
                events: updatedEvents,
                invalidatedDays: updatedInvalidatedDays
            }
        }));
    },
    
    // Notificar o calendário sobre mudanças no gestor
    notifyCalendar: function(type, data) {
        // Tentar via postMessage primeiro
        const iframe = document.querySelector('#calendar-component-container iframe');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({
                type: 'GESTOR_UPDATE',
                data: { type, data }
            }, '*');
        }
        
        // Também atualizar localStorage para sincronização
        const currentEvents = JSON.parse(localStorage.getItem('calendarEvents') || '{}');
        localStorage.setItem('calendarEvents', JSON.stringify(currentEvents));
    }
};

// Função para atualizar contagem de dias no gestor
function updateDayCountFromCalendar(invalidatedDays) {
    // Esta função deve integrar com sua lógica existente de contagem de dias
    console.log('Dias invalidados no calendário:', invalidatedDays);
    
    // Exemplo: Atualizar um contador visual
    const invalidCountElement = document.getElementById('invalid-days-count');
    if (invalidCountElement) {
        invalidCountElement.textContent = invalidatedDays.length;
    }
    
    // Aqui você chama suas funções existentes do gestor
    if (window.updateRemainingDays) {
        window.updateRemainingDays(); // Sua função existente
    }
    
    // Ou calcule diretamente:
    calculateRemainingDays(invalidatedDays);
}

function calculateRemainingDays(invalidatedDays) {
    // Supondo que você tenha uma data final definida
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-12-31');
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    // Dias de fim de semana entre as datas
    let weekendDays = 0;
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Domingo ou Sábado
            weekendDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Dias invalidados (excluindo fins de semana que já não contam)
    const invalidatedWeekdays = invalidatedDays.filter(dateStr => {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6; // Apenas dias úteis
    }).length;
    
    const remainingDays = totalDays - weekendDays - invalidatedWeekdays;
    
    // Atualizar na interface do gestor
    updateGestorDisplay(remainingDays, invalidatedWeekdays);
}

function updateGestorDisplay(remainingDays, invalidatedCount) {
    // Atualize os elementos do seu gestor aqui
    const remainingElement = document.getElementById('remaining-days');
    const invalidatedElement = document.getElementById('invalidated-days');
    
    if (remainingElement) {
        remainingElement.textContent = remainingDays;
    }
    if (invalidatedElement) {
        invalidatedElement.textContent = invalidatedCount;
    }
}

function updateEventsFromCalendar(events) {
    console.log('Eventos atualizados do calendário:', events);
    // Integre com seu sistema de eventos existente
    if (window.refreshGestorEvents) {
        window.refreshGestorEvents(events);
    }
}

// Inicializar integração quando o calendário carregar
function onCalendarLoaded(iframe) {
    console.log('Calendário carregado - inicializando integração...');
    calendarIntegration.init();
    
    // Forçar sincronização inicial
    setTimeout(() => {
        calendarIntegration.handleCalendarUpdate();
    }, 500);
}