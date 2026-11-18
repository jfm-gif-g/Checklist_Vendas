tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    blue: 'var(--brand-blue)',
                    lightBlue: 'var(--brand-light-blue)',
                    orange: 'var(--brand-accent)',
                    orangeHover: 'var(--brand-accent-hover)'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif']
            }
        }
    }
};

let dadosChecklist = null, usuarioAtivo = { nome: "", estado: "", empresa: "" }, campoPendenteAtual = null, logoMarcaAtiva = "";
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const g = id => document.getElementById(id);
const mostrar = (id, show) => { g(id).classList.toggle('hidden', !show); g(id).classList.toggle('fade-in', show); };

const filiaisPorEstado = {
    "SE": ["Maracar Veículos", "Gama PSA_SE", "Gama Seminovos", "Audi-SE", "Gama DFM", "Gama Leap_SE"],
    "PB": ["Gama PSA_JP", "Gama PSA_CG", "Gama Leap_CG", "Gama Seminovos"],
    "AL": ["Ford Gama", "Gama PSA_AL", "Gama Seminovos", "Audi-AL", "Volvo Gama", "Gama Royal", "Gama Dafra", "Gama Kawasaki", "Gama CFMOTO"]
};

const temasMarcas = {
    "MARACAR": { blue: "#001e50", lightBlue: "#002b70", accent: "#00b0f0", accentHover: "#008ac0", logo: "images/Logo-Volks.jpeg" },
    "PSA": { blue: "#000000", lightBlue: "#333333", accent: "#00539f", accentHover: "#003b73", logo: "images/Logo-Peugeo_Citroen.jpeg" },
    "LEAP": { blue: "#041c26", lightBlue: "#083344", accent: "#00a88f", accentHover: "#008f7a", logo: "images/Logo-leap.jpeg" },
    "DFM": { blue: "#ba0c2f", lightBlue: "#8a0923", accent: "#1d1d1b", accentHover: "#000000", logo: "images/Logo-Dongfeng.jpeg" },
    "FORD": { blue: "#003478", lightBlue: "#001e4a", accent: "#00a9e0", accentHover: "#00769c", logo: "images/Logo-Ford.jpeg" },
    "VOLVO": { blue: "#14375c", lightBlue: "#0e2640", accent: "#8c9296", accentHover: "#6e7377", logo: "images/Logo-Volvo.jpeg" },
    "ROYAL": { blue: "#cc0000", lightBlue: "#990000", accent: "#000000", accentHover: "#333333", logo: "images/Logo-Royal.jpeg" },
    "DAFRA": { blue: "#e30613", lightBlue: "#b3050f", accent: "#000000", accentHover: "#333333", logo: "images/Logo-Dafra.jpeg" },
    "KAWASAKI": { blue: "#000000", lightBlue: "#1a1a1a", accent: "#66ff00", accentHover: "#4dcc00", logo: "images/Logo-Kawasaki.jpeg" },
    "CFMOTO": { blue: "#00397a", lightBlue: "#002b5e", accent: "#00a0e9", accentHover: "#007ab3", logo: "images/Logo CFmoto.jpeg" },
    "AUDI-SE": { blue: "#000000", lightBlue: "#1a1a1a", accent: "#e60000", accentHover: "#b30000", logo: "images/Logo Audi-aju.jpeg" },
    "AUDI-AL": { blue: "#000000", lightBlue: "#1a1a1a", accent: "#e60000", accentHover: "#b30000", logo: "images/Logo-Audi-maceio.jpeg" },
    "AUDI": { blue: "#000000", lightBlue: "#1a1a1a", accent: "#e60000", accentHover: "#b30000", logo: "images/Logo-Audi-maceio.jpeg" },
    "PADRAO": { blue: "#0B2447", lightBlue: "#19376D", accent: "#F97B22", accentHover: "#E0691B", logo: "images/Logo-Padrao.png" }
};

document.addEventListener('DOMContentLoaded', () => {
    // Limpa qualquer sessão antiga presa no localStorage
    localStorage.removeItem('usuarioChecklist');

    handleFormChanges();
    g('loginForm').addEventListener('submit', e => { e.preventDefault(); acessarSistema(); });
    document.querySelectorAll('label:not([for])').forEach(l => {
        if (!l.querySelector('input,select')) {
            const c = l.parentElement.querySelector(':scope > input[id], :scope > select[id]');
            if (c) l.htmlFor = c.id;
        }
    });

    // Salva automaticamente qualquer digitação ou clique nos checkboxes
    g('checklistForm').addEventListener('input', salvarRascunho);
    g('checklistForm').addEventListener('change', salvarRascunho);
    g('checklistOutput').addEventListener('change', salvarRascunho);

    try {
        const sessaoSalva = JSON.parse(sessionStorage.getItem('usuarioChecklist'));
        if (sessaoSalva && sessaoSalva.nome && sessaoSalva.estado && sessaoSalva.empresa) {
            usuarioAtivo = sessaoSalva;
            iniciarSessaoUI();
            restaurarRascunho();
        }
    } catch (err) {
        sessionStorage.removeItem('usuarioChecklist');
    }
});

function aplicarTema(emp) {
    const n = emp.toUpperCase();
    const key = Object.keys(temasMarcas).find(k => k !== "PADRAO" && n.includes(k)) || "PADRAO";
    const t = temasMarcas[key];
    const r = document.documentElement.style;

    r.setProperty('--brand-blue', t.blue);
    r.setProperty('--brand-light-blue', t.lightBlue);
    r.setProperty('--brand-accent', t.accent);
    r.setProperty('--brand-accent-hover', t.accentHover);

    const img = g('logoMarca'), divisor = g('divisorLogo');
    const printImg = g('printLogoMarca'), printDivisor = g('printDivisorLogo');

    if (key !== "PADRAO" && t.logo && t.logo !== "Images/Logo-Padrao.png") {
        logoMarcaAtiva = t.logo;
        img.src = printImg.src = t.logo;
        img.classList.remove('hidden'); divisor.classList.remove('hidden');
        printImg.classList.remove('hidden'); printDivisor.classList.remove('hidden');
        img.classList.add('fade-in');
    } else {
        logoMarcaAtiva = "";
        img.classList.add('hidden'); divisor.classList.add('hidden');
        printImg.classList.add('hidden'); printDivisor.classList.add('hidden');
        img.src = printImg.src = "";
    }
}

function atualizarLojas() {
    const e = g('estadoUsuario').value, s = g('empresaUsuario');
    s.disabled = !e;
    s.className = `w-full p-3 rounded-lg outline-none ${e ? 'bg-gray-50 border border-gray-300 text-gray-800 cursor-pointer focus:ring-2 focus:ring-brand-blue' : 'bg-gray-200 border border-gray-300 text-gray-500 cursor-not-allowed'}`;
    s.innerHTML = '<option value="" selected disabled>(Selecione sua base)</option>';
    (filiaisPorEstado[e] || []).forEach(f => s.add(new Option(f, f)));
}

function iniciarSessaoUI() {
    const { nome, estado, empresa } = usuarioAtivo;
    g('headerUserInfo').innerText = `${nome} // ${empresa} - ${estado}`;
    g('printUserInfo').innerText = `Vendedor: ${nome} | Unidade: ${empresa} - ${estado}`;
    aplicarTema(empresa);
    document.body.classList.remove('bg-login');
    document.body.classList.add('bg-operacao');
    mostrar('loginScreen', false);
    g('appScreen').classList.remove('hidden');
    g('appScreen').classList.add('flex');
}

function acessarSistema() {
    const [n, e, emp] = ['nomeUsuario', 'estadoUsuario', 'empresaUsuario'].map(id => g(id).value.trim());
    if (!n || !e || !emp) return alert("Preencha Nome, Estado e Filial.");
    usuarioAtivo = { nome: n, estado: e, empresa: emp };
    sessionStorage.setItem('usuarioChecklist', JSON.stringify(usuarioAtivo));
    iniciarSessaoUI();
}

function sairSistema() {
    sessionStorage.removeItem('usuarioChecklist');
    sessionStorage.removeItem('rascunhoChecklist');
    localStorage.removeItem('rascunhoChecklist');
    usuarioAtivo = { nome: "", estado: "", empresa: "" };
    g('loginForm').reset();
    atualizarLojas();
    g('checklistForm').reset();
    g('checklistOutput').innerHTML = g('printSummaryPage').innerHTML = '';
    dadosChecklist = null;
    handleFormChanges();
    aplicarTema("PADRAO");
    document.body.classList.remove('bg-operacao');
    document.body.classList.add('bg-login');
    mostrar('resultSection', false);
    g('appScreen').classList.remove('flex');
    mostrar('appScreen', false);
    mostrar('loginScreen', true);
}

const CAMPOS_TEXTO = ['nomeCliente', 'numProposta', 'tipoCliente', 'docCliente', 'tipoEmpresa', 'tipoFinanciamento', 'emplacamento'];
const CAMPOS_CHECK = ['pgtoAvista', 'pgtoFinanciamento', 'pgtoConsorcio', 'terceiroAvista', 'veiculoTroca', 'MultaIpva', 'terceiroUsado'];

function salvarRascunho() {
    const textos = {}, checks = {}, itensStatus = {};
    CAMPOS_TEXTO.forEach(id => textos[id] = g(id).value);
    CAMPOS_CHECK.forEach(id => checks[id] = g(id).checked);
    g('checklistOutput').querySelectorAll('input[type="checkbox"]').forEach(cb => {
        itensStatus[cb.value] = cb.checked;
    });

    sessionStorage.setItem('rascunhoChecklist', JSON.stringify({
        textos,
        checks,
        gerado: !!dadosChecklist,
        itensStatus
    }));
}

function restaurarRascunho() {
    try {
        const salvo = JSON.parse(sessionStorage.getItem('rascunhoChecklist'));
        if (!salvo) return;

        CAMPOS_CHECK.forEach(id => {
            if (salvo.checks && id in salvo.checks) g(id).checked = salvo.checks[id];
        });
        CAMPOS_TEXTO.forEach(id => {
            if (salvo.textos && id in salvo.textos) g(id).value = salvo.textos[id];
        });

        handleFormChanges();
        if (salvo.textos && salvo.textos.docCliente) {
            g('docCliente').value = salvo.textos.docCliente;
        }

        if (salvo.gerado) {
            gerarChecklist(true);
            if (salvo.itensStatus) {
                g('checklistOutput').querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    if (cb.value in salvo.itensStatus) cb.checked = salvo.itensStatus[cb.value];
                });
            }
            salvarRascunho();
        }
    } catch (err) {
        sessionStorage.removeItem('rascunhoChecklist');
    }
}

function handleFormChanges() {
    const t = g('tipoCliente').value, dc = g('docCliente'), tr = g('veiculoTroca').checked;
    mostrar('divDocCliente', !!t);
    if (t) {
        if (dc.dataset.prev !== t) { dc.value = ''; dc.dataset.prev = t; }
        g('lblDocCliente').innerText = t === 'CPF' ? 'CPF DO CLIENTE' : 'CNPJ DO CLIENTE';
        dc.placeholder = t === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00';
        dc.maxLength = t === 'CPF' ? 14 : 18;
    }
    mostrar('divTipoEmpresa', t === 'CNPJ');
    mostrar('divFinanciamento', g('pgtoFinanciamento').checked);
    mostrar('divTerceiroAvista', g('pgtoAvista').checked);
    mostrar('divMultaIpva', tr);
    mostrar('divTerceiroUsado', tr);
    const campoNome = g('nomeCliente');
    if (campoNome && campoNome.value) mascararCliente(campoNome);
}

const REGRAS = [
    { t: 'Documentação Básica', i: [['Proposta assinada'], ['NF de venda (Estoque ou VDI)'], ['CNH', e => e.tc === 'CPF'], ['Comprovante de residência', e => e.tc === 'CPF'], ['Cartão CNPJ', e => e.tc === 'CNPJ'], ['CCMEI', e => e.tc === 'CNPJ' && e.te === 'MEI'], ['Contrato social', e => e.tc === 'CNPJ' && ['SLU', 'LTDA', 'EI'].includes(e.te)], ['Doc. sócio administrador', e => e.tc === 'CNPJ'], ['QSA', e => e.tc === 'CNPJ']] },
    { t: 'Emplacamento', i: [['Planilha', e => ['loja', 'cliente'].includes(e.emp)], ['Custo inserido no Gerveic', e => e.emp === 'loja'], ['Comprovante de pagamento', e => e.emp === 'cliente'], ['A informação "Emplacamento externo" deve constar na proposta', e => e.emp === 'externo']] },
    { t: 'Pagamento / Financeiro', i: [['Comprovante de pagamento (À vista)', e => e.pa], ['Documento do Terceiro pagador', e => e.pa && e.ta], ['Carta de transferência assinada', e => e.pa && e.ta], ['Contrato financiamento (CET)', e => e.pf && e.tf === 'interno'], ['Comp. pagamento financiamento (Interno)', e => e.pf && e.tf === 'interno'], ['Autorização de faturamento', e => e.pf && e.tf === 'externo'], ['Comp. pagamento financiamento (Externo)', e => e.pf && e.tf === 'externo'], ['Carta de crédito', e => e.pc], ['Comp. pagamento consórcio', e => e.pc]] },
    { t: 'Documentação do Usado na Troca', q: e => e.vt, i: [['Planilha de custo (Valor transferência)'], ['Comp. pagamento do custo'], ['NF do usado'], ['Avaliação do usado'], ['Checklist preenchido'], ['Consulta PRF'], ['Consulta Detran'], ['Comprovante pagamento Multa/IPVA', e => e.mi], ['Consulta Renajud'], ['CRV/ATPV preenchido'], ['Termo de responsabilidade'], ['Vistoria cautelar aprovada'], ['Doc. do proprietário'], ['Carta de transferência do usado', e => e.tu]] }
];

function lerFormulario() {
    return { nc: g('nomeCliente').value.trim(), np: g('numProposta').value.trim(), dc: g('docCliente').value.trim(), tc: g('tipoCliente').value, te: g('tipoEmpresa').value, pa: g('pgtoAvista').checked, pf: g('pgtoFinanciamento').checked, pc: g('pgtoConsorcio').checked, tf: g('tipoFinanciamento').value, ta: g('terceiroAvista').checked, emp: g('emplacamento').value, vt: g('veiculoTroca').checked, mi: g('MultaIpva').checked, tu: g('terceiroUsado').checked };
}

function gerarChecklist(restaurando = false) {
    const e = lerFormulario();
    if (!e.nc) return mostrarAlerta("Preencha o NOME DO CLIENTE.", "nomeCliente");
    if (!e.np) return mostrarAlerta("Informe o Nº DA PROPOSTA.", "numProposta");
    if (!e.tc) return mostrarAlerta("Selecione Pessoa Física ou Jurídica.", "tipoCliente");
    if (!e.dc) return mostrarAlerta("Informe o DOCUMENTO.", "docCliente");

    const num = e.dc.replace(/[^A-Z0-9]/g, '');
    if (e.tc === 'CPF' && (!/^\d{11}$/.test(num) || !cpfValido(e.dc))) return mostrarAlerta("CPF inválido ou incompleto.", "docCliente");
    if (e.tc === 'CNPJ' && (num.length !== 14 || !cnpjValido(e.dc))) return mostrarAlerta("CNPJ inválido ou incompleto.", "docCliente");
    if (e.tc === 'CNPJ' && !e.te) return mostrarAlerta("Selecione o TIPO DE EMPRESA.", "tipoEmpresa");
    if (!e.pa && !e.pf && !e.pc) return mostrarAlerta("Selecione uma FORMA DE PAGAMENTO.", "pgtoAvista");
    if (e.pf && !e.tf) return mostrarAlerta("Informe o TIPO DE FINANCIAMENTO.", "tipoFinanciamento");
    if (!e.emp) return mostrarAlerta("Selecione o responsável pelo EMPLACAMENTO.", "emplacamento");

    dadosChecklist = e;
    g('printUserInfo').innerText = `Vendedor: ${usuarioAtivo.nome} | Unidade: ${usuarioAtivo.empresa} - ${usuarioAtivo.estado} | Cliente: ${e.nc.toUpperCase()} (${e.tc}: ${e.dc})`;

    const html = `<div class="bg-brand-blue text-white p-5 rounded-xl mb-6 border-l-4 border-brand-orange"><h3 class="font-bold text-xl mb-1">${esc(e.nc.toUpperCase())}</h3><p class="text-sm">Proposta: ${esc(e.np)} | ${e.tc}: ${esc(e.dc)}</p></div>` +
        REGRAS.filter(s => !s.q || s.q(e)).map(s => `<h3 class="font-bold text-brand-blue text-lg mt-5 mb-3 border-b-2 border-brand-orange pb-1">${esc(s.t.toUpperCase())}</h3>` + s.i.filter(([, c]) => !c || c(e)).map(([t]) => `<label class="block cursor-pointer mb-2"><input type="checkbox" checked class="peer sr-only" value="${esc(t)}"><div class="hidden peer-checked:flex items-center p-3 bg-white rounded-xl shadow-sm border border-gray-200"><div class="w-7 h-7 mr-3 rounded-lg flex items-center justify-center bg-green-500 text-white shadow-sm">✔</div><span class="flex-1 text-sm font-semibold text-gray-700">${esc(t)}</span><span class="ml-3 text-[10px] font-bold px-3 py-1 rounded bg-green-100 text-green-800">POSSUI</span></div><div class="flex peer-checked:hidden items-center p-3 bg-red-50 rounded-xl shadow-sm border-2 border-red-400"><div class="w-7 h-7 mr-3 rounded-lg flex items-center justify-center bg-red-500 text-white shadow-sm">✖</div><span class="flex-1 text-sm font-semibold text-red-900">${esc(t)}</span><span class="ml-3 text-[10px] font-bold px-3 py-1 rounded bg-red-600 text-white">FALTA</span></div></label>`).join('')).join('');

    g('checklistOutput').innerHTML = html;
    mostrar('resultSection', true);
    if (!restaurando) {
        setTimeout(() => g('resultSection').scrollIntoView({ behavior: 'smooth' }), 100);
    }
    g('copyBtnText').innerText = "COPIAR TEXTO";
    g('copyBtn').className = 'flex-1 bg-brand-blue hover:bg-brand-lightBlue text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center gap-2 shadow-md';
    salvarRascunho();
}

function copiarParaAreaDeTransferencia() {
    if (!dadosChecklist) return;
    const p = [], r = []; let sec = '';
    Array.from(g('checklistOutput').children).forEach(el => {
        if (el.tagName === 'H3') sec = el.textContent.trim();
        else if (el.tagName === 'LABEL') {
            const c = el.querySelector('input');
            if (c) c.checked ? r.push(`✅ ${c.value}`) : p.push(`❌ ${c.value} (${sec})`);
        }
    });
    const t = `👤 *Vendedor:* ${usuarioAtivo.nome}\n🏢 *Unidade:* ${usuarioAtivo.empresa} - ${usuarioAtivo.estado}\n📝 *Proposta:* ${dadosChecklist.np}\n🤝 *Cliente:* ${dadosChecklist.nc} (${dadosChecklist.tc}: ${dadosChecklist.dc})\n---\n` + (p.length ? `🚨 *PENDÊNCIAS:*\n${p.join('\n')}\n\n` : '') + (r.length ? `📂 *ENTREGUES:*\n${r.join('\n')}` : '');
    navigator.clipboard.writeText(t).then(() => {
        g('copyBtnText').innerText = "COPIADO!";
        g('copyBtn').classList.replace('bg-brand-blue', 'bg-green-600');
        setTimeout(() => {
            g('copyBtnText').innerText = "COPIAR TEXTO";
            g('copyBtn').classList.replace('bg-green-600', 'bg-brand-blue');
        }, 3000);
    }).catch(() => alert("Erro ao copiar."));
}

function prepararImpressao() {
    if (!dadosChecklist) return;
    const p = []; let sec = '';
    Array.from(g('checklistOutput').children).forEach(el => {
        if (el.tagName === 'H3') sec = el.textContent;
        else if (el.tagName === 'LABEL') {
            const c = el.querySelector('input');
            if (c && !c.checked) p.push({ i: c.value, s: sec });
        }
    });

    const logosHtml = `
        <div class="h-12 flex items-center gap-4 shrink-0">
            <img src="Images/Logo-Padrao.png" alt="Grupo Gama" class="h-full max-w-[130px] object-contain">
            ${logoMarcaAtiva ? `<div class="h-8 w-px bg-gray-300"></div><img src="${esc(logoMarcaAtiva)}" alt="" class="h-full max-w-[130px] object-contain">` : ''}
        </div>`;

    const cab = `
        <p class="text-sm font-semibold mt-1">Vendedor: ${esc(usuarioAtivo.nome)} | Unidade: ${esc(usuarioAtivo.empresa)} - ${esc(usuarioAtivo.estado)}</p>
        <p class="text-sm font-semibold mt-0.5">Cliente: ${esc(dadosChecklist.nc)} (${esc(dadosChecklist.tc)}: ${esc(dadosChecklist.dc)}) | Prop: ${esc(dadosChecklist.np)}</p>`;

    g('printSummaryPage').innerHTML = p.length ? `
        <div class="quebra-pagina pt-10">
            <div class="flex justify-between items-center gap-4 mb-6 border-b-2 border-red-500 pb-4">
                <div><h2 class="text-2xl font-bold text-red-600">Pendências</h2>${cab}</div>
                ${logosHtml}
            </div>
            <ul class="flex flex-col gap-3 mb-12">${p.map(x => `<li class="bg-gray-50 p-3 rounded-lg border">❌ <b>${esc(x.i)}</b> <span class="text-sm text-gray-500">(Ref: ${esc(x.s)})</span></li>`).join('')}</ul>
            <div class="mt-16 pt-10 border-t-2 border-gray-300 grid grid-cols-2 gap-8 text-center text-gray-600">
                <div><p class="border-b border-gray-400 h-8 mb-2"></p>Assinatura Cliente</div>
                <div><p class="border-b border-gray-400 h-8 mb-2"></p>Vendedor</div>
            </div>
        </div>` : `
        <div class="quebra-pagina pt-10">
            <div class="flex justify-between items-center gap-4 mb-6 border-b-2 border-green-500 pb-4">
                <div><h2 class="text-2xl font-bold text-green-600">Status Documentação</h2>${cab}</div>
                ${logosHtml}
            </div>
            <div class="bg-green-50 p-8 rounded-xl text-center mt-10"><p class="text-green-700 font-bold text-2xl">✅ Tudo entregue!</p></div>
        </div>`;
    window.print();
}

function mascararNome(i) {
    const excecoes = ['da', 'de', 'do', 'das', 'dos', 'e'];
    const limpo = i.value.replace(/[^a-zA-ZÀ-ÿ\s']/g, '').replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
    i.value = limpo.toLowerCase().replace(/\S+/g, (p, idx) =>
        idx > 0 && excecoes.includes(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)
    );
}

function mascararDocumento(i) {
    const t = g('tipoCliente').value;
    let d = i.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (t === 'CPF') {
        d = d.replace(/\D/g, '').slice(0, 11)
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else if (t === 'CNPJ') {
        d = d.slice(0, 14)
            .replace(/^([A-Z0-9]{2})([A-Z0-9])/, '$1.$2')
            .replace(/^([A-Z0-9]{2}\.[A-Z0-9]{3})([A-Z0-9])/, '$1.$2')
            .replace(/^([A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3})([A-Z0-9])/, '$1/$2')
            .replace(/^([A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4})([A-Z0-9]{1,2})/, '$1-$2');
    }
    i.value = d;
}

function mascararCliente(i) {
    const tipo = g('tipoCliente').value;
    let v = i.value.toUpperCase();
    v = tipo === 'CPF'
        ? v.replace(/[^A-ZÀ-Ÿ\s']/g, '')
        : v.replace(/[^A-ZÀ-Ÿ0-9\s&.,\-\/]/g, '');
    i.value = v.replace(/^\s+/, '').replace(/\s{2,}/g, ' ');
}

function mascararProposta(i) {
    let d = i.value.replace(/\D/g, '').slice(0, 10);
    if (d.length > 1) d = d.replace(/^(\d+)(\d)$/, '$1/$2');
    i.value = d;
}

function cpfValido(v) {
    const c = v.replace(/\D/g, '');
    if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
    const dv = n => {
        let s = 0;
        for (let i = 0; i < n; i++) s += Number(c[i]) * (n + 1 - i);
        const r = (s * 10) % 11;
        return r === 10 ? 0 : r;
    };
    return dv(9) === Number(c[9]) && dv(10) === Number(c[10]);
}

function cnpjValido(v) {
    const c = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^[A-Z0-9]{12}\d{2}$/.test(c) || /^(.)\1+$/.test(c)) return false;
    const dv = b => {
        let p = b.length - 7, s = 0;
        for (const ch of b) {
            s += (ch.charCodeAt(0) - 48) * p--;
            if (p < 2) p = 9;
        }
        const r = s % 11;
        return r < 2 ? 0 : 11 - r;
    };
    const d1 = dv(c.slice(0, 12));
    return c.endsWith(`${d1}${dv(c.slice(0, 12) + d1)}`);
}

function mostrarAlerta(m, id) { g('modalTexto').innerText = m; mostrar('modalAlerta', true); campoPendenteAtual = id; }
function fecharModal() {
    mostrar('modalAlerta', false);
    const c = g(campoPendenteAtual);
    if (!c) return;
    c.scrollIntoView({ behavior: 'smooth', block: 'center' });
    c.classList.replace('border-gray-300', 'border-red-500');
    c.classList.add('ring-4', 'ring-red-200');
    c.focus();
    const limpa = () => {
        c.classList.replace('border-red-500', 'border-gray-300');
        c.classList.remove('ring-4', 'ring-red-200');
    };
    c.addEventListener('input', limpa, { once: true });
    c.addEventListener('change', limpa, { once: true });
}