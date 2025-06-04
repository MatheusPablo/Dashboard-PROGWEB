const APPLICATION_ID = "Byl4PeFJ3v5Jk4Ak01ttylbSYsSudsng4c1FY2Pm";
const REST_API_KEY = "yFoiTLcDRqXQkvqPkFBxZvKRHAK5XByQdBaxhVOs";

async function buscarTodosOsDados() {
  let offset = 0;
  const limit = 1000;
  const todosOsDados = [];

  while (true) {
    const url = `https://parseapi.back4app.com/classes/DadosPortalRecife?limit=${limit}&skip=${offset}`;
    const response = await fetch(url, {
      headers: {
        "X-Parse-Application-Id": APPLICATION_ID,
        "X-Parse-REST-API-Key": REST_API_KEY,
      },
    });
    const data = await response.json();
    const registros = data.results || [];
    todosOsDados.push(...registros);
    if (registros.length < limit) break;
    offset += limit;
  }

  return todosOsDados;
}

function agruparContagem(dados, campo, limite = null) {
  const contagem = {};
  dados.forEach((item) => {
    const chave = item[campo] || "Não informado";
    contagem[chave] = (contagem[chave] || 0) + 1;
  });
  let resultado = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
  if (limite) resultado = resultado.slice(0, limite);
  return {
    labels: resultado.map(([label]) => label),
    data: resultado.map(([, valor]) => valor),
  };
}

function criarGrafico(id, tipo, labels, data, label = "") {
  const ctx = document.getElementById(id).getContext("2d");
  new Chart(ctx, {
    type: tipo,
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: [
          "#4f46e5", "#6d28d9", "#3b82f6", "#10b981", "#f59e0b",
          "#ef4444", "#ec4899", "#22d3ee", "#8b5cf6", "#6366f1"
        ],
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: tipo === 'pie' || tipo === 'doughnut' },
      },
      scales: tipo === 'bar' ? {
        y: {
          beginAtZero: true,
          ticks: { color: "#e5e7eb" },
          grid: { color: "#374151" }
        },
        x: {
          ticks: { color: "#e5e7eb" },
          grid: { color: "#374151" }
        }
      } : {},
    }
  });
}

async function iniciarGraficos() {
  const dados = await buscarTodosOsDados();

  criarGrafico("escolasChart", "bar", 
    agruparContagem(dados, "escola", 10).labels,
    agruparContagem(dados, "escola", 10).data,
    "Número de Alunos");

  criarGrafico("generoChart", "pie",
    ["Masculino", "Feminino"],
    [
      dados.filter(d => d.sexo === "1").length,
      dados.filter(d => d.sexo === "2").length
    ],
    "Sexo");

  criarGrafico("turnoChart", "doughnut",
    agruparContagem(dados, "turno").labels,
    agruparContagem(dados, "turno").data,
    "Turno");

  criarGrafico("idadeChart", "bar",
    agruparContagem(dados, "idade").labels,
    agruparContagem(dados, "idade").data,
    "Idade");

  criarGrafico("modalidadeChart", "bar",
    agruparContagem(dados, "modalidadeEnsino").labels,
    agruparContagem(dados, "modalidadeEnsino").data,
    "Modalidade de Ensino");

  criarGrafico("situacaoChart", "bar",
    agruparContagem(dados, "situacaoNome", 5).labels,
    agruparContagem(dados, "situacaoNome", 5).data,
    "Situação Final");
}

document.addEventListener("DOMContentLoaded", iniciarGraficos);
