import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import { Orcamento } from "@/components/layout/interface";

export async function generateBudgetPdf(budget: Orcamento): Promise<string> {
  const formatMoney = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("pt-BR");

  const categoriesHtml = budget.categoria
    .map(
      (categoria, index) => `
      <h2>${index + 1}. ${categoria.nome}</h2>

      <table>
        <thead>
          <tr>
            <th>Serviço</th>
            <th>Un.</th>
            <th>Qtd.</th>
            <th>Valor Unit.</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>

        ${categoria.servicos
          .map(
            (servico) => `
            <tr>
              <td>${servico.nome}</td>
              <td>${servico.unidade}</td>
              <td>${servico.quantidade_unidade}</td>
              <td>${formatMoney(servico.preco_da_unidade)}</td>
              <td>${formatMoney(servico.preco_total)}</td>
            </tr>
          `,
          )
          .join("")}

        </tbody>

      </table>

      <div class="subtotal">
        Subtotal da categoria:
        <strong>${formatMoney(categoria.preco_total_da_categoria)}</strong>
      </div>
    `,
    )
    .join("");

  const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="utf-8"/>

<style>

body{

font-family:Arial;
padding:30px;
font-size:12px;
color:#222;

}

.header{

text-align:center;
margin-bottom:30px;

}

.title{

font-size:26px;
font-weight:bold;
margin-bottom:10px;

}

.info{

display:flex;
justify-content:space-between;
margin-bottom:20px;

}

.section{

margin-top:20px;

}

table{

width:100%;
border-collapse:collapse;
margin-top:10px;
margin-bottom:20px;

}

th{

background:#1565C0;
color:white;
padding:8px;
font-size:12px;

}

td{

border:1px solid #DDD;
padding:6px;

}

.subtotal{

text-align:right;
font-size:13px;
margin-bottom:30px;

}

.footer{

margin-top:40px;
border-top:2px solid #CCC;
padding-top:15px;

}

.total{

font-size:20px;
font-weight:bold;
color:#1565C0;

}

</style>

</head>

<body>

<div class="header">

<div class="title">
ORÇAMENTO SINTÉTICO
</div>

<div>
Obra Fácil
</div>

</div>

<div class="info">

<div>

<strong>Cliente</strong><br/>

${budget.cliente.nome}

</div>

<div>

<strong>Status</strong><br/>

${budget.status}

</div>

</div>

<div>

<strong>Orçamento</strong>

${budget.nome}

</div>

<br/>

<div>

<strong>Descrição</strong>

${budget.descricao}

</div>

<br/>

<div>

<strong>Endereço</strong><br/>

${budget.endereco.rua},
${budget.endereco.numero}
<br/>

${budget.endereco.bairro}
<br/>

${budget.endereco.cidade}
-
${budget.endereco.estado}
<br/>

CEP:
${budget.endereco.CEP}

</div>

<br/>

<div>

<strong>Data publicação:</strong>

${formatDate(budget.data_publicacao)}

<br/>

<strong>Validade:</strong>

${budget.valido_durante} dias

</div>

<div class="section">

${categoriesHtml}

</div>

<div class="footer">

<p>

Custo Direto:
<strong>${formatMoney(budget.preco)}</strong>

</p>

<p>

BDI:
<strong>${budget.bdi}%</strong>

</p>

<p class="total">

TOTAL DA OBRA

${formatMoney(budget.preco_com_bdi)}

</p>

</div>

</body>

</html>
`;

  const { uri } = await Print.printToFileAsync({
    html,
  });

  return uri;
}
