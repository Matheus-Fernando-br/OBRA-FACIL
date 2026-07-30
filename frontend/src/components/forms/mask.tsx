export function documentMask(value: string) {
  const numbers = value.replace(/\D/g, "");

  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      .slice(0, 14);
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

export function cpfMask(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14);
}

export function cnpjMask(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18);
}

export function phoneMask(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  return numbers
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function cepMask(value: string) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
}

export function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

export function emailMask(value: string) {
  return value
    .replace(/\s/g, "") // remove espaços
    .toLowerCase(); // converte para minúsculo
}

export function maskDate(value: string) {
  // Remove tudo que não for número
  value = value.replace(/\D/g, "");

  // Limita o total a 8 dígitos (DDMMAAAA)
  value = value.slice(0, 8);

  // 1. Validação do DIA (máximo 31)
  if (value.length >= 2) {
    let day = parseInt(value.slice(0, 2), 10);
    if (day > 31) day = 31;
    if (day === 0) day = 1; // Opcional: evita dia "00"

    const dayStr = String(day).padStart(2, "0");
    value = dayStr + value.slice(2);
  }

  // 2. Validação do MÊS (máximo 12)
  if (value.length >= 4) {
    let month = parseInt(value.slice(2, 4), 10);
    if (month > 12) month = 12;
    if (month === 0) month = 1; // Opcional: evita mês "00"

    const monthStr = String(month).padStart(2, "0");
    value = value.slice(0, 2) + monthStr + value.slice(4);
  }

  // 3. Validação do ANO (deve começar com 2, ex: anos 2000+)
  if (value.length >= 5) {
    const firstYearDigit = value[4];
    if (firstYearDigit !== "2") {
      // Força o primeiro dígito do ano a ser 2
      value = value.slice(0, 4) + "2" + value.slice(5);
    }
  }

  // --- Aplicação da Máscara visual com as barras ---

  // Formata DD/MM/AAAA ou DD/MM/A...
  if (value.length >= 4) {
    return value.replace(/(\d{2})(\d{2})(\d{0,4})/, (match, p1, p2, p3) => {
      return p3 ? `${p1}/${p2}/${p3}` : `${p1}/${p2}/`;
    });
  }

  // Formata DD/MM ou DD/M
  if (value.length >= 2) {
    return value.replace(/(\d{2})(\d{0,2})/, (match, p1, p2) => {
      return p2 ? `${p1}/${p2}` : `${p1}/`;
    });
  }

  return value;
}
