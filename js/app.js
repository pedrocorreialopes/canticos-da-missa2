/**
 * Folha de Cânticos - Aplicação Principal
 * Gerenciamento de cânticos litúrgicos e folhas de missa
 */

const API_BASE = 'tables/';

// ============================================================
// ESTADO GLOBAL
// ============================================================
let cantos = [];
let folhas = [];
let cantosFiltrados = [];
let folhasFiltradas = [];
let paginaAtual = 1;
let paginaAtualFolhas = 1;
const ITENS_POR_PAGINA = 10;

// ============================================================
// INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    mostrarSecao('dashboard');
    carregarDados();
    configurarEventos();
});

// ============================================================
// NAVEGAÇÃO
// ============================================================
function mostrarSecao(secao) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    
    const secaoEl = document.getElementById(`secao-${secao}`);
    if (secaoEl) secaoEl.classList.add('active');
    
    const navLink = document.querySelector(`nav a[data-secao="${secao}"]`);
    if (navLink) navLink.classList.add('active');
    
    // Atualizar dados específicos da seção
    if (secao === 'cantos') renderizarTabelaCantos();
    if (secao === 'folhas') renderizarTabelaFolhas();
    if (secao === 'gerar-folha') carregarOpcoesCantos();
    if (secao === 'dashboard') carregarDashboard();
}

function configurarEventos() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarSecao(link.dataset.secao);
        });
    });
}

// ============================================================
// API
// ============================================================
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        if (response.status === 204) return null;
        return await response.json();
    } catch (erro) {
        console.error('Erro API:', erro);
        mostrarAlerta('Erro de conexão. Tente novamente.', 'error');
        throw erro;
    }
}

async function carregarDados() {
    await Promise.all([
        carregarCantos(),
        carregarFolhas()
    ]);
    carregarDashboard();
}

// ============================================================
// CÂNTICOS
// ============================================================
async function carregarCantos() {
    try {
        const resultado = await fetchAPI(`${API_BASE}cantos?limit=100&sort=titulo`);
        cantos = resultado.data || [];
        cantosFiltrados = [...cantos];
        renderizarTabelaCantos();
    } catch (erro) {
        console.error('Erro ao carregar cânticos:', erro);
    }
}

function renderizarTabelaCantos() {
    const tbody = document.querySelector('#tabela-cantos tbody');
    const totalEl = document.getElementById('total-cantos');
    const paginacaoEl = document.getElementById('paginacao-cantos');
    
    if (!tbody) return;
    
    totalEl.textContent = cantosFiltrados.length;
    
    const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const paginados = cantosFiltrados.slice(inicio, fim);
    
    if (paginados.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="6" class="text-center">
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <h3>Nenhum cântico encontrado</h3>
                    <p>Adicione cânticos usando o botão acima</p>
                </div>
            </td></tr>
        `;
        paginacaoEl.innerHTML = '';
        return;
    }
    
    tbody.innerHTML = paginados.map(canto => `
        <tr data-id="${canto.id}">
            <td><strong>${canto.titulo}</strong></td>
            <td><span class="badge badge-${slugCategoria(canto.categoria)}">${canto.categoria}</span></td>
            <td>${canto.autor || '-'}</td>
            <td>${canto.tom || '-'}</td>
            <td>${canto.referencia_biblica || '-'}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-secondary" onclick="verCanto('${canto.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="editarCanto('${canto.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirCanto('${canto.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Paginação
    const totalPaginas = Math.ceil(cantosFiltrados.length / ITENS_POR_PAGINA);
    let htmlPaginacao = '<div class="btn-group">';
    
    htmlPaginacao += `<button class="btn btn-sm btn-secondary" ${paginaAtual === 1 ? 'disabled' : ''} onclick="mudarPagina(${paginaAtual - 1})"><i class="fas fa-chevron-left"></i></button>`;
    
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaAtual - 1 && i <= paginaAtual + 1)) {
            htmlPaginacao += `<button class="btn btn-sm ${i === paginaAtual ? 'btn-primary' : 'btn-secondary'}" onclick="mudarPagina(${i})">${i}</button>`;
        } else if (i === paginaAtual - 2 || i === paginaAtual + 2) {
            htmlPaginacao += `<span class="btn btn-sm btn-secondary" disabled>...</span>`;
        }
    }
    
    htmlPaginacao += `<button class="btn btn-sm btn-secondary" ${paginaAtual === totalPaginas ? 'disabled' : ''} onclick="mudarPagina(${paginaAtual + 1})"><i class="fas fa-chevron-right"></i></button>`;
    htmlPaginacao += '</div>';
    
    paginacaoEl.innerHTML = htmlPaginacao;
}

function slugCategoria(categoria) {
    return categoria.toLowerCase().replace(/\s+/g, '-');
}

function mudarPagina(pagina) {
    paginaAtual = pagina;
    renderizarTabelaCantos();
}

function filtrarCantos() {
    const termo = document.getElementById('busca-cantos').value.toLowerCase();
    cantosFiltrados = cantos.filter(c =>
        (c.titulo && c.titulo.toLowerCase().includes(termo)) ||
        (c.autor && c.autor.toLowerCase().includes(termo)) ||
        (c.categoria && c.categoria.toLowerCase().includes(termo))
    );
    paginaAtual = 1;
    renderizarTabelaCantos();
}

function limparFiltroCantos() {
    document.getElementById('busca-cantos').value = '';
    cantosFiltrados = [...cantos];
    paginaAtual = 1;
    renderizarTabelaCantos();
}

// ============================================================
// MODAL CÂNTICO
// ============================================================
let cantoEditando = null;

function abrirModalCanto() {
    cantoEditando = null;
    document.getElementById('form-canto').reset();
    document.getElementById('modal-canto-titulo').textContent = 'Novo Cântico';
    abrirModal('modal-canto');
}

function editarCanto(id) {
    const canto = cantos.find(c => c.id === id);
    if (!canto) return;
    
    cantoEditando = canto;
    document.getElementById('canto-titulo').value = canto.titulo || '';
    document.getElementById('canto-categoria').value = canto.categoria || '';
    document.getElementById('canto-letra').value = canto.letra || '';
    document.getElementById('canto-tom').value = canto.tom || '';
    document.getElementById('canto-autor').value = canto.autor || '';
    document.getElementById('canto-referencia').value = canto.referencia_biblica || '';
    document.getElementById('canto-observacoes').value = canto.observacoes || '';
    document.getElementById('modal-canto-titulo').textContent = 'Editar Cântico';
    abrirModal('modal-canto');
}

async function salvarCanto(e) {
    e.preventDefault();
    
    const dados = {
        titulo: document.getElementById('canto-titulo').value.trim(),
        categoria: document.getElementById('canto-categoria').value,
        letra: document.getElementById('canto-letra').value.trim(),
        tom: document.getElementById('canto-tom').value.trim(),
        autor: document.getElementById('canto-autor').value.trim(),
        referencia_biblica: document.getElementById('canto-referencia').value.trim(),
        observacoes: document.getElementById('canto-observacoes').value.trim()
    };
    
    if (!dados.titulo || !dados.categoria) {
        mostrarAlerta('Preencha título e categoria', 'warning');
        return;
    }
    
    try {
        if (cantoEditando) {
            await fetchAPI(`${API_BASE}cantos/${cantoEditando.id}`, {
                method: 'PUT',
                body: JSON.stringify(dados)
            });
            mostrarAlerta('Cântico atualizado com sucesso!', 'success');
        } else {
            await fetchAPI(`${API_BASE}cantos`, {
                method: 'POST',
                body: JSON.stringify(dados)
            });
            mostrarAlerta('Cântico criado com sucesso!', 'success');
        }
        
        fecharModal('modal-canto');
        await carregarCantos();
    } catch (erro) {
        mostrarAlerta('Erro ao salvar cântico', 'error');
    }
}

async function excluirCanto(id) {
    if (!confirm('Tem certeza que deseja excluir este cântico?')) return;
    
    try {
        await fetchAPI(`${API_BASE}cantos/${id}`, { method: 'DELETE' });
        mostrarAlerta('Cântico excluído com sucesso!', 'success');
        await carregarCantos();
    } catch (erro) {
        mostrarAlerta('Erro ao excluir cântico', 'error');
    }
}

// ============================================================
// VER CÂNTICO
// ============================================================
function verCanto(id) {
    const canto = cantos.find(c => c.id === id);
    if (!canto) return;
    
    document.getElementById('ver-canto-titulo').textContent = canto.titulo;
    document.getElementById('ver-canto-categoria').textContent = canto.categoria;
    document.getElementById('ver-canto-categoria').className = `badge badge-${slugCategoria(canto.categoria)}`;
    document.getElementById('ver-canto-letra').innerHTML = formatarLetra(canto.letra || 'Sem letra disponível');
    document.getElementById('ver-canto-tom').textContent = canto.tom || 'Não informado';
    document.getElementById('ver-canto-autor').textContent = canto.autor || 'Não informado';
    document.getElementById('ver-canto-referencia').textContent = canto.referencia_biblica || 'Não informada';
    document.getElementById('ver-canto-observacoes').textContent = canto.observacoes || 'Nenhuma observação';
    
    abrirModal('modal-ver-canto');
}

function formatarLetra(letra) {
    if (!letra) return '<em>Sem letra disponível</em>';
    return letra
        .replace(/\n/g, '<br>')
        .replace(/(Refrão:.*?)(?=<br>|$)/gi, '<strong class="refrain">$1</strong>');
}

// ============================================================
// FOLHAS DE MISSA
// ============================================================
async function carregarFolhas() {
    try {
        const resultado = await fetchAPI(`${API_BASE}folhas_missas?limit=100&sort=data`);
        folhas = resultado.data || [];
        folhasFiltradas = [...folhas];
        renderizarTabelaFolhas();
    } catch (erro) {
        console.error('Erro ao carregar folhas:', erro);
    }
}

function renderizarTabelaFolhas() {
    const tbody = document.querySelector('#tabela-folhas tbody');
    const totalEl = document.getElementById('total-folhas');
    const paginacaoEl = document.getElementById('paginacao-folhas');
    
    if (!tbody) return;
    
    totalEl.textContent = folhasFiltradas.length;
    
    const inicio = (paginaAtualFolhas - 1) * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const paginadas = folhasFiltradas.slice(inicio, fim);
    
    if (paginadas.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5" class="text-center">
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <h3>Nenhuma folha encontrada</h3>
                    <p>Crie folhas de missa usando o botão acima</p>
                </div>
            </td></tr>
        `;
        paginacaoEl.innerHTML = '';
        return;
    }
    
    tbody.innerHTML = paginadas.map(folha => {
        const data = folha.data ? new Date(folha.data) : null;
        const dataStr = data ? data.toLocaleDateString('pt-BR') : '-';
        const horaStr = data ? data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
        
        return `
            <tr data-id="${folha.id}">
                <td><strong>${folha.titulo}</strong></td>
                <td>
                    ${dataStr}<br>
                    <small style="color: var(--cor-texto-claro)">${horaStr}</small>
                </td>
                <td>
                    <span class="badge" style="background: ${corLiturgicaHex(folha.cor_liturgica)}; color: white;">
                        ${folha.cor_liturgica}
                    </span>
                </td>
                <td><span class="badge badge-${folha.ocasiao.toLowerCase()}">${folha.ocasiao}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-accent" onclick="verFolha('${folha.id}')">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="editarFolha('${folha.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="imprimirFolha('${folha.id}')">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="excluirFolha('${folha.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // Paginação
    const totalPaginas = Math.ceil(folhasFiltradas.length / ITENS_POR_PAGINA);
    let htmlPaginacao = '<div class="btn-group">';
    
    htmlPaginacao += `<button class="btn btn-sm btn-secondary" ${paginaAtualFolhas === 1 ? 'disabled' : ''} onclick="mudarPaginaFolha(${paginaAtualFolhas - 1})"><i class="fas fa-chevron-left"></i></button>`;
    
    for (let i = 1; i <= totalPaginas; i++) {
        if (i === 1 || i === totalPaginas || (i >= paginaAtualFolhas - 1 && i <= paginaAtualFolhas + 1)) {
            htmlPaginacao += `<button class="btn btn-sm ${i === paginaAtualFolhas ? 'btn-primary' : 'btn-secondary'}" onclick="mudarPaginaFolha(${i})">${i}</button>`;
        } else if (i === paginaAtualFolhas - 2 || i === paginaAtualFolhas + 2) {
            htmlPaginacao += `<span class="btn btn-sm btn-secondary" disabled>...</span>`;
        }
    }
    
    htmlPaginacao += `<button class="btn btn-sm btn-secondary" ${paginaAtualFolhas === totalPaginas ? 'disabled' : ''} onclick="mudarPaginaFolha(${paginaAtualFolhas + 1})"><i class="fas fa-chevron-right"></i></button>`;
    htmlPaginacao += '</div>';
    
    paginacaoEl.innerHTML = htmlPaginacao;
}

function mudarPaginaFolha(pagina) {
    paginaAtualFolhas = pagina;
    renderizarTabelaFolhas();
}

function filtrarFolhas() {
    const termo = document.getElementById('busca-folhas').value.toLowerCase();
    folhasFiltradas = folhas.filter(f =>
        (f.titulo && f.titulo.toLowerCase().includes(termo)) ||
        (f.ocasiao && f.ocasiao.toLowerCase().includes(termo)) ||
        (f.cor_liturgica && f.cor_liturgica.toLowerCase().includes(termo))
    );
    paginaAtualFolhas = 1;
    renderizarTabelaFolhas();
}

function limparFiltroFolhas() {
    document.getElementById('busca-folhas').value = '';
    folhasFiltradas = [...folhas];
    paginaAtualFolhas = 1;
    renderizarTabelaFolhas();
}

function corLiturgicaHex(cor) {
    const cores = {
        'Verde': '#276749',
        'Roxo': '#553c9a',
        'Vermelho': '#c53030',
        'Branco': '#a0aec0',
        'Rosa': '#d53f8c',
        'Preto': '#1a202c'
    };
    return cores[cor] || '#718096';
}

// ============================================================
// MODAL FOLHA
// ============================================================
let folhaEditando = null;

function abrirModalFolha() {
    folhaEditando = null;
    document.getElementById('form-folha').reset();
    document.getElementById('modal-folha-titulo').textContent = 'Nova Folha de Missa';
    carregarSelectsDeCantos();
    abrirModal('modal-folha');
}

function editarFolha(id) {
    const folha = folhas.find(f => f.id === id);
    if (!folha) return;
    
    folhaEditando = folha;
    carregarSelectsDeCantos();
    
    document.getElementById('folha-titulo').value = folha.titulo || '';
    document.getElementById('folha-data').value = folha.data ? folha.data.split('T')[0] : '';
    document.getElementById('folha-hora').value = folha.data ? folha.data.split('T')[1]?.slice(0, 5) : '';
    document.getElementById('folha-cor').value = folha.cor_liturgica || '';
    document.getElementById('folha-ocasiao').value = folha.ocasiao || '';
    document.getElementById('folha-observacoes').value = folha.observacoes || '';
    
    document.getElementById('modal-folha-titulo').textContent = 'Editar Folha de Missa';
    abrirModal('modal-folha');
}

function carregarSelectsDeCantos() {
    const momentos = ['entrada', 'ato-penitencial', 'gloria', 'salmo', 'aleluia', 'ofertorio', 'santo', 'comunhao', 'final'];
    
    momentos.forEach(momento => {
        const select = document.getElementById(`folha-${momento}`);
        if (!select) return;
        
        const categoriaMap = {
            'entrada': 'Entrada',
            'ato-penitencial': 'Ato Penitencial',
            'gloria': 'Glória',
            'salmo': 'Salmo',
            'aleluia': 'Aleluia',
            'ofertorio': 'Ofertório',
            'santo': 'Santo',
            'comunhao': 'Comunhão',
            'final': 'Final'
        };
        
        const cantosCategoria = cantos.filter(c => c.categoria === categoriaMap[momento]);
        const outroCantos = cantos.filter(c => c.categoria === 'Outro');
        
        let options = '<option value="">Selecione...</option>';
        
        if (cantosCategoria.length > 0) {
            options += `<optgroup label="${categoriaMap[momento]}">`;
            cantosCategoria.forEach(c => {
                options += `<option value="${c.id}">${c.titulo}</option>`;
            });
            options += '</optgroup>';
        }
        
        if (outroCantos.length > 0) {
            options += '<optgroup label="Outros">';
            outroCantos.forEach(c => {
                options += `<option value="${c.id}">${c.titulo}</option>`;
            });
            options += '</optgroup>';
        }
        
        const valorAtual = folhaEditando ? folhaEditando[`${momento}_canto_id`] : '';
        select.innerHTML = options;
        select.value = valorAtual || '';
    });
}

async function salvarFolha(e) {
    e.preventDefault();
    
    const data = document.getElementById('folha-data').value;
    const hora = document.getElementById('folha-hora').value;
    const dataHora = data && hora ? `${data}T${hora}:00` : data ? `${data}T00:00:00` : null;
    
    const dados = {
        titulo: document.getElementById('folha-titulo').value.trim(),
        data: dataHora,
        cor_liturgica: document.getElementById('folha-cor').value,
        ocasiao: document.getElementById('folha-ocasiao').value,
        observacoes: document.getElementById('folha-observacoes').value.trim(),
        entrada_canto_id: document.getElementById('folha-entrada').value || null,
        ato_penitencial_canto_id: document.getElementById('folha-ato-penitencial').value || null,
        gloria_canto_id: document.getElementById('folha-gloria').value || null,
        salmo_canto_id: document.getElementById('folha-salmo').value || null,
        aleluia_canto_id: document.getElementById('folha-aleluia').value || null,
        ofertorio_canto_id: document.getElementById('folha-ofertorio').value || null,
        santo_canto_id: document.getElementById('folha-santo').value || null,
        comunhao_canto_id: document.getElementById('folha-comunhao').value || null,
        final_canto_id: document.getElementById('folha-final').value || null
    };
    
    if (!dados.titulo || !dados.cor_liturgica || !dados.ocasiao) {
        mostrarAlerta('Preencha título, cor litúrgica e ocasião', 'warning');
        return;
    }
    
    try {
        if (folhaEditando) {
            await fetchAPI(`${API_BASE}folhas_missas/${folhaEditando.id}`, {
                method: 'PUT',
                body: JSON.stringify(dados)
            });
            mostrarAlerta('Folha atualizada com sucesso!', 'success');
        } else {
            await fetchAPI(`${API_BASE}folhas_missas`, {
                method: 'POST',
                body: JSON.stringify(dados)
            });
            mostrarAlerta('Folha criada com sucesso!', 'success');
        }
        
        fecharModal('modal-folha');
        await carregarFolhas();
    } catch (erro) {
        mostrarAlerta('Erro ao salvar folha', 'error');
    }
}

async function excluirFolha(id) {
    if (!confirm('Tem certeza que deseja excluir esta folha de missa?')) return;
    
    try {
        await fetchAPI(`${API_BASE}folhas_missas/${id}`, { method: 'DELETE' });
        mostrarAlerta('Folha excluída com sucesso!', 'success');
        await carregarFolhas();
    } catch (erro) {
        mostrarAlerta('Erro ao excluir folha', 'error');
    }
}

// ============================================================
// VISUALIZAR FOLHA
// ============================================================
async function verFolha(id) {
    try {
        const folha = await fetchAPI(`${API_BASE}folhas_missas/${id}`);
        if (!folha) return;
        
        const momentos = [
            { key: 'entrada_canto_id', nome: 'Entrada' },
            { key: 'ato_penitencial_canto_id', nome: 'Ato Penitencial' },
            { key: 'gloria_canto_id', nome: 'Glória' },
            { key: 'salmo_canto_id', nome: 'Salmo' },
            { key: 'aleluia_canto_id', nome: 'Aleluia' },
            { key: 'ofertorio_canto_id', nome: 'Ofertório' },
            { key: 'santo_canto_id', nome: 'Santo' },
            { key: 'comunhao_canto_id', nome: 'Comunhão' },
            { key: 'final_canto_id', nome: 'Final' }
        ];
        
        const container = document.getElementById('folha-visualizacao');
        
        const data = folha.data ? new Date(folha.data) : null;
        const dataStr = data ? data.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
        const horaStr = data ? data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
        
        let html = `
            <div style="text-align: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid var(--cor-destaque);">
                <h2 style="font-family: var(--fonte-titulo); color: var(--cor-primaria); font-size: 1.6rem; margin-bottom: 0.5rem;">
                    ${folha.titulo}
                </h2>
                ${dataStr ? `<p style="color: var(--cor-destaque); font-weight: 600; margin-bottom: 0.25rem;">${dataStr}</p>` : ''}
                ${horaStr ? `<p style="color: var(--cor-texto-claro);">Horário: ${horaStr}</p>` : ''}
                <div style="margin-top: 0.75rem;">
                    <span class="badge" style="background: ${corLiturgicaHex(folha.cor_liturgica)}; color: white; padding: 0.5rem 1rem;">
                        ${folha.cor_liturgica}
                    </span>
                    <span class="badge badge-${folha.ocasiao.toLowerCase()}" style="margin-left: 0.5rem; padding: 0.5rem 1rem;">
                        ${folha.ocasiao}
                    </span>
                </div>
            </div>
            <div style="display: grid; gap: 1rem;">
        `;
        
        momentos.forEach(momento => {
            const cantoId = folha[momento.key];
            if (cantoId) {
                const canto = cantos.find(c => c.id === cantoId);
                if (canto) {
                    html += `
                        <div style="background: var(--cor-fundo); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--cor-destaque);">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 700; color: var(--cor-primaria); text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.05em;">
                                    ${momento.nome}
                                </span>
                                ${canto.tom ? `<span style="font-size: 0.8rem; color: var(--cor-destaque); font-weight: 600;">Tom: ${canto.tom}</span>` : ''}
                            </div>
                            <h3 style="font-family: var(--fonte-titulo); color: var(--cor-primaria); font-size: 1.1rem; margin-bottom: 0.5rem;">
                                ${canto.titulo}
                            </h3>
                            ${canto.autor ? `<p style="font-size: 0.85rem; color: var(--cor-texto-claro); margin-bottom: 0.5rem;">Autor: ${canto.autor}</p>` : ''}
                            <div style="font-size: 0.95rem; line-height: 1.8; color: var(--cor-texto); white-space: pre-line; max-height: 200px; overflow-y: auto; padding: 0.75rem; background: white; border-radius: 6px;">
                                ${canto.letra || '<em>Sem letra disponível</em>'}
                            </div>
                        </div>
                    `;
                }
            }
        });
        
        html += '</div>';
        
        if (folha.observacoes) {
            html += `
                <div style="margin-top: 1.5rem; padding: 1rem; background: var(--cor-fundo); border-radius: 8px;">
                    <strong style="color: var(--cor-primaria); display: block; margin-bottom: 0.5rem;">Observações:</strong>
                    <p style="color: var(--cor-texto);">${folha.observacoes}</p>
                </div>
            `;
        }
        
        container.innerHTML = html;
        abrirModal('modal-ver-folha');
    } catch (erro) {
        mostrarAlerta('Erro ao carregar folha', 'error');
    }
}

function imprimirFolha(id) {
    verFolha(id);
    setTimeout(() => {
        window.print();
    }, 500);
}

// ============================================================
// GERAR FOLHA (INTERFACE SIMPLIFICADA)
// ============================================================
function carregarOpcoesCantos() {
    const momentos = [
        { id: 'gerar-entrada', categoria: 'Entrada' },
        { id: 'gerar-ato-penitencial', categoria: 'Ato Penitencial' },
        { id: 'gerar-gloria', categoria: 'Glória' },
        { id: 'gerar-salmo', categoria: 'Salmo' },
        { id: 'gerar-aleluia', categoria: 'Aleluia' },
        { id: 'gerar-ofertorio', categoria: 'Ofertório' },
        { id: 'gerar-santo', categoria: 'Santo' },
        { id: 'gerar-comunhao', categoria: 'Comunhão' },
        { id: 'gerar-final', categoria: 'Final' }
    ];
    
    momentos.forEach(m => {
        const select = document.getElementById(m.id);
        if (!select) return;
        
        const cantosCat = cantos.filter(c => c.categoria === m.categoria);
        const outros = cantos.filter(c => c.categoria === 'Outro');
        
        let options = '<option value="">Selecione um cântico...</option>';
        
        if (cantosCat.length > 0) {
            options += `<optgroup label="${m.categoria}">`;
            cantosCat.forEach(c => {
                options += `<option value="${c.id}">${c.titulo}${c.tom ? ` (Tom: ${c.tom})` : ''}</option>`;
            });
            options += '</optgroup>';
        }
        
        if (outros.length > 0) {
            options += '<optgroup label="Outros">';
            outros.forEach(c => {
                options += `<option value="${c.id}">${c.titulo}${c.tom ? ` (Tom: ${c.tom})` : ''}</option>`;
            });
            options += '</optgroup>';
        }
        
        select.innerHTML = options;
    });
}

async function gerarFolhaMissa(e) {
    e.preventDefault();
    
    const data = document.getElementById('gerar-data').value;
    const hora = document.getElementById('gerar-hora').value;
    const dataHora = data && hora ? `${data}T${hora}:00` : data ? `${data}T00:00:00` : null;
    
    const dados = {
        titulo: document.getElementById('gerar-titulo').value.trim(),
        data: dataHora,
        cor_liturgica: document.getElementById('gerar-cor').value,
        ocasiao: document.getElementById('gerar-ocasiao').value,
        observacoes: document.getElementById('gerar-observacoes').value.trim(),
        entrada_canto_id: document.getElementById('gerar-entrada').value || null,
        ato_penitencial_canto_id: document.getElementById('gerar-ato-penitencial').value || null,
        gloria_canto_id: document.getElementById('gerar-gloria').value || null,
        salmo_canto_id: document.getElementById('gerar-salmo').value || null,
        aleluia_canto_id: document.getElementById('gerar-aleluia').value || null,
        ofertorio_canto_id: document.getElementById('gerar-ofertorio').value || null,
        santo_canto_id: document.getElementById('gerar-santo').value || null,
        comunhao_canto_id: document.getElementById('gerar-comunhao').value || null,
        final_canto_id: document.getElementById('gerar-final').value || null
    };
    
    if (!dados.titulo || !dados.cor_liturgica || !dados.ocasiao) {
        mostrarAlerta('Preencha título, cor litúrgica e ocasião', 'warning');
        return;
    }
    
    try {
        const resultado = await fetchAPI(`${API_BASE}folhas_missas`, {
            method: 'POST',
            body: JSON.stringify(dados)
        });
        
        mostrarAlerta('Folha de missa criada com sucesso!', 'success');
        document.getElementById('form-gerar-folha').reset();
        await carregarFolhas();
        verFolha(resultado.id);
    } catch (erro) {
        mostrarAlerta('Erro ao criar folha', 'error');
    }
}

// ============================================================
// DASHBOARD
// ============================================================
function carregarDashboard() {
    document.getElementById('dash-total-cantos').textContent = cantos.length;
    document.getElementById('dash-total-folhas').textContent = folhas.length;
    
    const categorias = {};
    cantos.forEach(c => {
        categorias[c.categoria] = (categorias[c.categoria] || 0) + 1;
    });
    
    const container = document.getElementById('dash-categorias');
    if (Object.keys(categorias).length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--cor-texto-claro);">Nenhum cântico cadastrado</p>';
    } else {
        const cores = [
            '#1a365d', '#2c5282', '#b7791f', '#276749', 
            '#553c9a', '#c53030', '#d69e2e', '#718096'
        ];
        
        container.innerHTML = Object.entries(categorias)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([cat, qtd], i) => `
                <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: ${cores[i % cores.length]}; flex-shrink: 0;"></div>
                    <span style="flex: 1; font-size: 0.9rem;">${cat}</span>
                    <span style="font-weight: 700; color: var(--cor-primaria); font-family: var(--fonte-titulo);">${qtd}</span>
                </div>
            `).join('');
    }
    
    const folhasRecentes = [...folhas]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
    
    const containerFolhas = document.getElementById('dash-folhas-recentes');
    if (folhasRecentes.length === 0) {
        containerFolhas.innerHTML = '<p style="text-align: center; color: var(--cor-texto-claro);">Nenhuma folha criada</p>';
    } else {
        containerFolhas.innerHTML = folhasRecentes.map(f => {
            const data = f.data ? new Date(f.data) : null;
            const dataStr = data ? data.toLocaleDateString('pt-BR') : '-';
            
            return `
                <div style="padding: 0.75rem; border-bottom: 1px solid var(--cor-borda); cursor: pointer; transition: var(--transicao); border-radius: 6px;"
                     onmouseover="this.style.background='rgba(26,54,93,0.03)';"
                     onmouseout="this.style.background='transparent';"
                     onclick="verFolha('${f.id}')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="font-size: 0.9rem; color: var(--cor-primaria);">${f.titulo}</strong>
                        <span style="font-size: 0.8rem; color: var(--cor-texto-claro);">${dataStr}</span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--cor-texto-claro); margin-top: 0.25rem;">
                        <span class="badge badge-${f.ocasiao.toLowerCase()}">${f.ocasiao}</span>
                        <span class="badge" style="background: ${corLiturgicaHex(f.cor_liturgica)}; color: white; margin-left: 0.25rem;">${f.cor_liturgica}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ============================================================
// MODAL UTILITÁRIOS
// ============================================================
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function fecharTodosModais() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
}

// ============================================================
// ALERTAS
// ============================================================
function mostrarAlerta(mensagem, tipo = 'success') {
    const container = document.getElementById('alertas');
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo}`;
    
    const icones = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle'
    };
    
    alerta.innerHTML = `
        <i class="fas ${icones[tipo]}"></i>
        <span>${mensagem}</span>
    `;
    
    container.appendChild(alerta);
    
    setTimeout(() => {
        alerta.style.opacity = '0';
        alerta.style.transform = 'translateX(20px)';
        setTimeout(() => alerta.remove(), 300);
    }, 4000);
}

// ============================================================
// EVENTOS GLOBAIS
// ============================================================
document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) fecharTodosModais();
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharTodosModais();
});
