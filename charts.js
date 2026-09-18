function createLineChart(canvasId, labels, values, options = {}) {
  const canvas = document.getElementById(canvasId);

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  const width = canvas.parentElement.clientWidth || 500;
  const height = 240;
  const ratio = window.devicePixelRatio || 1;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, height);

  const padding = {
    top: 20,
    right: 20,
    bottom: 35,
    left: 35
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = options.maxValue || 100;
  const minValue = options.minValue || 0;

  context.font = "11px Arial";
  context.textAlign = "right";
  context.fillStyle = "#8791a8";
  context.strokeStyle = "#edf0f6";
  context.lineWidth = 1;

  for (let index = 0; index <= 4; index += 1) {
    const y = padding.top + (chartHeight / 4) * index;
    const value = maxValue - ((maxValue - minValue) / 4) * index;

    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();

    context.fillText(`${Math.round(value)}%`, padding.left - 8, y + 4);
  }

  const points = values.map((value, index) => {
    const x =
      padding.left +
      (labels.length === 1
        ? chartWidth / 2
        : (chartWidth / (labels.length - 1)) * index);

    const y =
      padding.top +
      chartHeight -
      ((value - minValue) / (maxValue - minValue)) * chartHeight;

    return {
      x,
      y
    };
  });

  const gradient = context.createLinearGradient(
    0,
    padding.top,
    0,
    height - padding.bottom
  );

  gradient.addColorStop(0, "rgba(49, 87, 213, 0.24)");
  gradient.addColorStop(1, "rgba(49, 87, 213, 0.01)");

  context.beginPath();

  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });

  context.lineTo(points[points.length - 1].x, height - padding.bottom);
  context.lineTo(points[0].x, height - padding.bottom);
  context.closePath();
  context.fillStyle = gradient;
  context.fill();

  context.beginPath();

  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });

  context.strokeStyle = options.color || "#3157d5";
  context.lineWidth = 3;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.stroke();

  points.forEach((point, index) => {
    context.beginPath();
    context.arc(point.x, point.y, 4, 0, Math.PI * 2);
    context.fillStyle = "#ffffff";
    context.fill();
    context.strokeStyle = options.color || "#3157d5";
    context.lineWidth = 2;
    context.stroke();

    context.textAlign = "center";
    context.fillStyle = "#8791a8";
    context.font = "11px Arial";
    context.fillText(labels[index], point.x, height - 10);
  });
}

function createBarChart(canvasId, labels, values, options = {}) {
  const canvas = document.getElementById(canvasId);

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  const width = canvas.parentElement.clientWidth || 500;
  const height = 240;
  const ratio = window.devicePixelRatio || 1;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, height);

  const padding = {
    top: 20,
    right: 20,
    bottom: 45,
    left: 35
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue =
    options.maxValue || Math.max(...values, 10);

  context.font = "11px Arial";
  context.textAlign = "right";
  context.fillStyle = "#8791a8";
  context.strokeStyle = "#edf0f6";
  context.lineWidth = 1;

  for (let index = 0; index <= 4; index += 1) {
    const y = padding.top + (chartHeight / 4) * index;
    const value = maxValue - (maxValue / 4) * index;

    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();

    context.fillText(`${Math.round(value)}`, padding.left - 8, y + 4);
  }

  const slotWidth = chartWidth / values.length;
  const barWidth = Math.min(42, slotWidth * 0.55);

  values.forEach((value, index) => {
    const barHeight = (value / maxValue) * chartHeight;
    const x =
      padding.left +
      slotWidth * index +
      (slotWidth - barWidth) / 2;

    const y = padding.top + chartHeight - barHeight;

    const gradient = context.createLinearGradient(
      0,
      y,
      0,
      padding.top + chartHeight
    );

    gradient.addColorStop(0, options.color || "#3157d5");
    gradient.addColorStop(1, "#9aa9ff");

    context.fillStyle = gradient;
    context.beginPath();
    context.roundRect(x, y, barWidth, barHeight, 6);
    context.fill();

    context.textAlign = "center";
    context.fillStyle = "#65718b";
    context.font = "11px Arial";
    context.fillText(labels[index], x + barWidth / 2, height - 13);
  });
}

function createDonutChart(canvasId, values, colors, centerText = "") {
  const canvas = document.getElementById(canvasId);

  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  const size = 180;
  const ratio = window.devicePixelRatio || 1;

  canvas.width = size * ratio;
  canvas.height = size * ratio;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  context.scale(ratio, ratio);
  context.clearRect(0, 0, size, size);

  const total = values.reduce((sum, value) => sum + value, 0);
  let startAngle = -Math.PI / 2;

  values.forEach((value, index) => {
    const angle = (value / total) * Math.PI * 2;

    context.beginPath();
    context.moveTo(size / 2, size / 2);
    context.arc(
      size / 2,
      size / 2,
      75,
      startAngle,
      startAngle + angle
    );
    context.closePath();
    context.fillStyle = colors[index];
    context.fill();

    startAngle += angle;
  });

  context.beginPath();
  context.arc(size / 2, size / 2, 47, 0, Math.PI * 2);
  context.fillStyle = "#ffffff";
  context.fill();

  context.fillStyle = "#16213f";
  context.font = "800 20px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(centerText, size / 2, size / 2);
}

function renderCharts() {
  if (typeof window.chartRenderers !== "undefined") {
    window.chartRenderers.forEach((renderer) => renderer());
  }
}