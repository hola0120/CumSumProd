class MathExtra {
  static degrees(x) {
    return (x * 180) / Math.PI;
  }
  static radians(x) {
    return (x * Math.PI) / 180;
  }
  static factorial(n) {
    if (n === 0 || n === 1) return 1;
    if (!this.memo) this.memo = [];
    if (this.memo[n] !== undefined) return this.memo[n];
    return (this.memo[n] = this.factorial(n - 1) * n);
  }
}

function MostrarOpciones() {
  let opciones = document.getElementById("modos").value;
  let contenedor = document.getElementById("container_options");
  contenedor.innerHTML = ""; // Limpiar contenido anterior

  // Limpiar resultados si existen
  let resultadoSumEl = document.getElementById("resultado_sumatorio");
  let resultadoProdEl = document.getElementById("resultado_productorio");
  if (resultadoSumEl && resultadoProdEl) {
    resultadoSumEl.textContent = "--";
    resultadoProdEl.textContent = "--";
  }

  if (opciones === "indices") {
    console.log("Modo de índices activado.");

    let inputI = document.createElement("input");
    inputI.type = "number";
    inputI.id = "i";
    inputI.placeholder = "Valor inicial (i)";
    contenedor.appendChild(inputI);

    let inputN = document.createElement("input");
    inputN.type = "number";
    inputN.id = "n";
    inputN.placeholder = "Valor final (n)";
    contenedor.appendChild(inputN);
  } else if (opciones === "array") {
    console.log("Modo de array activado.");

    let inputArray = document.createElement("input");
    inputArray.type = "text";
    inputArray.id = "array";
    inputArray.placeholder = "Introduce el arreglo (ej. 1, 2, 3)";
    contenedor.appendChild(inputArray);
  }

  // Campo para la expresión
  let inputExpr = document.createElement("input");
  inputExpr.type = "text";
  inputExpr.id = "expr";
  inputExpr.placeholder = "Introduce la expresión (ej. x^2 + 3)";
  contenedor.appendChild(inputExpr);

  // Botón para calcular
  let button = document.createElement("button");
  button.innerText = "Calcular";
  button.type = "button"; // Previene envío de formulario
  button.onclick = function () {
    let expr = document.getElementById("expr").value;
    let resultadoSum = 0;
    let resultadoProd = 1;
    let f;

    try {
      f = new Function("x", "return " + parseMathExpression(expr));
    } catch (error) {
      alert("Error en la expresión.");
      return;
    }

    if (opciones === "indices") {
      let i = parseInt(document.getElementById("i").value);
      let n = parseInt(document.getElementById("n").value);
      for (let j = i; j <= n; j++) {
        let val = f(j);
        resultadoSum += val;
        resultadoProd *= val;
      }
    } else if (opciones === "array") {
      let arrayStr = document.getElementById("array").value;
      let array = arrayStr.split(",").map(Number);
      for (let i = 0; i < array.length; i++) {
        let val = f(array[i]);
        resultadoSum += val;
        resultadoProd *= val;
      }
    }

    // Mostrar resultados
    document.getElementById("resultado_sumatorio").textContent = resultadoSum;
    document.getElementById("resultado_productorio").textContent =
      resultadoProd;
  };
  contenedor.appendChild(button);

  // Asegurarse de que el contenedor de resultados existe (si no, lo crea)
  if (!document.getElementById("resultados_finales")) {
    let resultContainer = document.createElement("div");
    resultContainer.id = "resultados_finales";
    resultContainer.style.marginTop = "20px";
    resultContainer.style.fontSize = "1.2rem";
    resultContainer.innerHTML = `
      <div>∑ = <span id="resultado_sumatorio">--</span></div>
      <div>∏ = <span id="resultado_productorio">--</span></div>
    `;
    contenedor.appendChild(resultContainer);
  }
}

function Sumatorio_indices(i, n, expr = "x+0") {
  let exprJS = parseMathExpression(expr);
  console.log("Expresión parseada:", expr, "=>", exprJS); // <-- ¡DEBUG!

  // Construimos la función con new Function
  let f = new Function("x", "return " + exprJS);

  let sum = 0;
  for (let j = i; j <= n; j++) {
    sum += f(j);
  }
  return sum;
}

function Sumatorio_array(array, expr = "x+0") {
  let exprJS = parseMathExpression(expr);
  console.log("Expresión parseada:", expr, "=>", exprJS); // <-- ¡DEBUG!

  // Construimos la función con new Function
  let f = new Function("x", "return " + exprJS);

  let sum = 0;
  for (let i = 0; i < array.length; i++) {
    sum += f(array[i]);
  }
  return sum;
}

function parseMathExpression(expr) {
  // Eliminar espacios
  expr = expr.replace(/\s+/g, "");

  // Reemplazar "pi", "π", "PI" por Math.PI
  expr = expr.replace(/\b(pi|PI|π)\b/g, "Math.PI");

  // Reemplazar funciones con símbolos por funciones estándar
  expr = expr.replace(/⌊\(?([a-zA-Z0-9+\-*/^.]+)\)?⌋/g, "floor($1)");
  expr = expr.replace(/⌈\(?([a-zA-Z0-9+\-*/^.]+)\)?⌉/g, "ceil($1)");
  expr = expr.replace(/√\(?([a-zA-Z0-9+\-*/^.]+)\)?/g, "sqrt($1)");

  // Funciones estándar (van a Math.<func>)
  const funciones = [
    "sqrt",
    "log10",
    "log2",
    "log",
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "atan2",
    "exp",
    "exp2",
    "exp10",
    "abs",
    "floor",
    "ceil",
    "hypot",
  ];

  // Funciones extra personalizadas (van a MathExtra.<func>)
  const funciones_extras = ["degrees", "radians", "factorial"];

  const protecciones = {};

  // Proteger funciones estándar
  funciones.forEach((nombre, i) => {
    const regex = new RegExp(`\\b${nombre}\\(`, "g");
    const marca = `__FUNC${i}__(`;
    expr = expr.replace(regex, marca);
    protecciones[marca] = `Math.${nombre}(`;
  });

  // Proteger funciones extra
  funciones_extras.forEach((nombre, i) => {
    const regex = new RegExp(`\\b${nombre}\\(`, "g");
    const marca = `__EXTRA${i}__(`;
    expr = expr.replace(regex, marca);
    protecciones[marca] = `MathExtra.${nombre}(`;
  });

  // Reemplazo de potencias ^ por Math.pow
  expr = expr.replace(
    /([a-zA-Z0-9\)\(]+)\^([a-zA-Z0-9\(\)]+)/g,
    "Math.pow($1,$2)"
  );

  // Multiplicación implícita segura
  expr = expr.replace(/\)\(/g, ")*("); // (x)(y) → (x)*(y)
  expr = expr.replace(/\)([a-zA-Z0-9])/g, ")*$1"); // (x)2 → (x)*2
  expr = expr.replace(/([0-9a-zA-Z])\(/g, "$1*("); // 2(x) → 2*(x)
  // Reemplazar factoriales como "n!" por MathExtra.factorial(n)
  expr = expr.replace(/(\d+|\b[a-zA-Z]+\b)!/g, "MathExtra.factorial($1)");

  expr = expr.replace(/\b([a-zA-Z])\b\s*\b([a-zA-Z])\b/g, "$1*$2"); // x y → x*y

  // Restaurar todas las funciones protegidas
  for (const [marca, real] of Object.entries(protecciones)) {
    const regex = new RegExp(marca.replace("(", "\\("), "g");
    expr = expr.replace(regex, real);
  }

  return expr;
}

// Ejecutar la función al cargar el DOM
addEventListener("DOMContentLoaded", MostrarOpciones);
