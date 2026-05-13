# 💸 Agenda de Gastos Compartidos (Shared Spends)

Una aplicación web moderna y minimalista para gestionar gastos grupales, calcular balances y determinar la forma más eficiente de saldar deudas entre amigos, familiares o compañeros de viaje.

## 🚀 Características

- **Gestión de Grupos**: Crea múltiples grupos para diferentes ocasiones (viajes, cenas, casa compartida).
- **Integrantes Personalizados**: Agrega y elimina participantes en cada grupo.
- **Registro de Gastos Detallado**:
  - Descripción del gasto.
  - Monto en Soles (S/).
  - Selección de pagador.
  - División personalizada (selecciona entre quiénes se divide el gasto).
- **Dashboard Inteligente**:
  - Visualización de balances individuales (quién debe y a quién le deben).
  - Algoritmo de transferencias óptimas para saldar deudas con el menor número de movimientos.
  - Historial de gastos con emojis automáticos basados en la descripción.
- **Persistencia Local**: Los datos se guardan automáticamente en el navegador (`localStorage`).

## 📁 Estructura del Proyecto

```text
D:\curso\code202\Shared-spends\
├── index.html                # Página principal (Ingreso de datos)
├── README.md                 # Documentación del proyecto
├── assets/
│   └── css/
│       ├── components/
│       │   └── header.css    # Estilos del encabezado compartido
│       └── pages/
│           ├── styles.config.css # Variables globales y reset
│           ├── index.css     # Estilos de la página principal
│           └── dashboard.css # Estilos del dashboard
├── js/
│   ├── state.js              # Gestión del estado global de la app
│   ├── storage.js            # Persistencia de datos en localStorage
│   ├── balance.js            # Lógica matemática de balances y deudas
│   ├── ui-index.js           # Lógica de la interfaz de la página principal
│   └── ui-dashboard.js       # Lógica de la interfaz del dashboard
└── pages/
    └── dashboard.html        # Página de visualización y resultados
```

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica.
- **CSS3**: Diseño responsivo utilizando Variables CSS, Flexbox y CSS Grid.
- **JavaScript (ES6+)**: Módulos nativos, manipulación del DOM y lógica de negocio.
- **Material Symbols**: Iconografía moderna.
- **Google Fonts**: Tipografías "DM Sans" y "DM Mono".

## 🧠 Lógica de Negocio

### Gestión de Estado (`state.js`)
El estado se maneja de forma centralizada en un objeto que contiene los grupos y el índice del grupo activo. Se utilizan funciones exportadas para interactuar con este estado de forma segura.

### Cálculos Matemáticos (`balance.js`)
El sistema utiliza dos algoritmos principales:
1.  **Cálculo de Balances**: Determina cuánto ha pagado cada persona versus cuánto debería haber pagado según los gastos en los que participó.
2.  **Cálculo de Transferencias**: Un algoritmo codicioso (greedy) que empareja al deudor más grande con el acreedor más grande para minimizar el número de transacciones necesarias para saldar el grupo.

### Persistencia (`storage.js`)
Implementa un wrapper sobre `localStorage` para guardar y cargar el estado de la aplicación, manejando posibles errores de datos corruptos.

## 📖 Cómo Usar

1.  **Crear un Grupo**: En la página principal, ingresa el nombre de tu grupo (ej. "Viaje a Cusco").
2.  **Agregar Integrantes**: Escribe los nombres de las personas que participan.
3.  **Registrar Gastos**: Cada vez que alguien pague algo, registra la descripción, el monto, quién pagó y entre quiénes se divide.
4.  **Ver Resultados**: Dirígete al Dashboard para ver quién debe dinero y cómo realizar los pagos para quedar a mano.

---
*Desarrollado como parte del curso Code202.*
