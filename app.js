const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const toast = document.getElementById('toast');
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalContent = document.getElementById('modalContent');

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function routeTo(route, resetScroll = true) {
  views.forEach((view) => view.classList.toggle('active', view.id === `view-${route}`));
  const navigationRoute = route === 'analysis' ? 'models' : route;
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.route === navigationRoute || item.dataset.navRoute === navigationRoute));
  if (resetScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-route]').forEach((button) => {
  button.addEventListener('click', () => routeTo(button.dataset.route));
});

const labMenuButton = document.getElementById('labMenuButton');
const labNavMenu = document.getElementById('labNavMenu');

function setLabMenu(open) {
  labNavMenu.hidden = !open;
  labMenuButton.setAttribute('aria-expanded', String(open));
}

const labDropdown = labMenuButton.closest('.nav-dropdown');

labDropdown.addEventListener('mouseenter', () => setLabMenu(true));
labDropdown.addEventListener('mouseleave', () => setLabMenu(false));
labDropdown.addEventListener('focusin', () => setLabMenu(true));
labDropdown.addEventListener('focusout', (event) => {
  if (!labDropdown.contains(event.relatedTarget)) setLabMenu(false);
});

labMenuButton.addEventListener('click', () => {
  routeTo('lab');
  setLabMenu(false);
});

labNavMenu.querySelectorAll('[data-lab-target]').forEach((button) => {
  button.addEventListener('click', () => {
    routeTo('lab', false);
    setLabMenu(false);
    window.requestAnimationFrame(() => {
      document.getElementById(button.dataset.labTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.nav-dropdown')) setLabMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setLabMenu(false);
    labMenuButton.focus();
  }
});

document.querySelectorAll('[data-placeholder]').forEach((button) => {
  button.addEventListener('click', () => showToast(`${button.dataset.placeholder}已预留入口，将在后续阶段接入。`));
});

const segments = document.querySelectorAll('.model-toolbar .segment');
const modelCards = document.querySelectorAll('.model-card');
const modelSearch = document.getElementById('modelSearch');
let currentFilter = 'all';

function filterModels() {
  const query = modelSearch.value.trim().toLowerCase();
  modelCards.forEach((card) => {
    const matchesCategory = currentFilter === 'all' || card.dataset.category === currentFilter;
    const matchesQuery = !query || card.dataset.name.toLowerCase().includes(query);
    card.classList.toggle('hidden', !(matchesCategory && matchesQuery));
  });
}

segments.forEach((segment) => {
  segment.addEventListener('click', () => {
    segments.forEach((item) => item.classList.remove('active'));
    segment.classList.add('active');
    currentFilter = segment.dataset.filter;
    filterModels();
  });
});
modelSearch.addEventListener('input', filterModels);

const projectRows = [...document.querySelectorAll('.project-table tbody tr')];
const projectSegments = document.querySelectorAll('.project-toolbar .segment');
const projectSearch = document.querySelector('.project-toolbar input[type="search"]');
const projectCount = document.querySelector('#projectCount');
const projectPrev = document.getElementById('projectPrev');
const projectNext = document.getElementById('projectNext');
const projectPageButtons = [...document.querySelectorAll('[data-project-page]')];
const projectsPerPage = 5;
let projectFilter = '全部项目';
let currentProjectPage = 1;

function filterProjects() {
  const query = projectSearch.value.trim().toLowerCase();
  const matchingRows = projectRows.filter((row) => {
    const status = row.querySelector('.row-status').textContent;
    const matchesStatus = projectFilter === '全部项目'
      || (projectFilter === '进行中' && status.includes('运行中'))
      || (projectFilter === '已完成' && status.includes('已完成'))
      || (projectFilter === '草稿' && status.includes('准备中'));
    return matchesStatus && row.textContent.toLowerCase().includes(query);
  });

  const totalPages = Math.max(1, Math.ceil(matchingRows.length / projectsPerPage));
  currentProjectPage = Math.min(currentProjectPage, totalPages);
  const pageStart = (currentProjectPage - 1) * projectsPerPage;
  const visibleRows = matchingRows.slice(pageStart, pageStart + projectsPerPage);
  projectRows.forEach((row) => { row.hidden = !visibleRows.includes(row); });

  const firstItem = matchingRows.length ? pageStart + 1 : 0;
  const lastItem = Math.min(pageStart + projectsPerPage, matchingRows.length);
  projectCount.textContent = matchingRows.length
    ? `显示 ${firstItem}-${lastItem} 项，共 ${matchingRows.length} 个项目`
    : '没有匹配的项目';
  projectPrev.disabled = currentProjectPage === 1;
  projectNext.disabled = currentProjectPage === totalPages;
  projectPageButtons.forEach((button) => {
    const page = Number(button.dataset.projectPage);
    button.hidden = page > totalPages;
    button.classList.toggle('active', page === currentProjectPage);
  });
}

projectSegments.forEach((segment) => {
  segment.addEventListener('click', () => {
    projectSegments.forEach((item) => item.classList.toggle('active', item === segment));
    projectFilter = segment.childNodes[0].textContent.trim();
    currentProjectPage = 1;
    filterProjects();
  });
});
projectSearch.addEventListener('input', () => {
  currentProjectPage = 1;
  filterProjects();
});
projectPageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentProjectPage = Number(button.dataset.projectPage);
    filterProjects();
  });
});
projectPrev.addEventListener('click', () => {
  if (currentProjectPage > 1) currentProjectPage -= 1;
  filterProjects();
});
projectNext.addEventListener('click', () => {
  currentProjectPage += 1;
  filterProjects();
});
filterProjects();
document.querySelectorAll('.disabled-model').forEach((button) => {
  button.addEventListener('click', () => showToast('该模型已预留入口，将在后续阶段接入。'));
});

const controls = [
  ['accessRange', 'accessOutput', (value) => `${value} 分钟`, '15'],
  ['exposureRange', 'exposureOutput', (value) => `${value} 分钟`, '15'],
  ['speedRange', 'speedOutput', (value) => `${Number(value).toFixed(1)} km/h`, '4'],
  ['shareRange', 'shareOutput', (value) => `${value}%`, '50'],
  ['internalSpeedRange', 'internalSpeedOutput', (value) => `${Number(value).toFixed(2)} km/h`, '3.17'],
];
controls.forEach(([inputId, outputId, formatter]) => {
  const input = document.getElementById(inputId);
  const output = document.getElementById(outputId);
  input.addEventListener('input', () => {
    output.textContent = formatter(input.value);
    updateAreaThreshold();
  });
});

function updateAreaThreshold() {
  const exposure = Number(document.getElementById('exposureRange').value);
  const share = Number(document.getElementById('shareRange').value) / 100;
  const speed = Number(document.getElementById('internalSpeedRange').value);
  const pathLength = exposure * share * speed * 1000 / 60;
  const areaHa = pathLength / 285;
  document.getElementById('areaThreshold').innerHTML = `${areaHa.toFixed(2)}<em> ha</em>`;
}

document.getElementById('resetParams').addEventListener('click', () => {
  controls.forEach(([inputId, outputId, formatter, defaultValue]) => {
    const input = document.getElementById(inputId);
    input.value = defaultValue;
    document.getElementById(outputId).textContent = formatter(defaultValue);
  });
  updateAreaThreshold();
  showToast('已恢复论文基准参数。');
});

const workflowPanels = document.querySelectorAll('.workflow-panel');
const workflowSteps = document.querySelectorAll('.workflow-step');
const stepOrder = ['setup', 'inspect', 'parameters', 'processing', 'results'];
let furthestStep = 0;

function goToWorkflowStep(step, force = false) {
  const nextIndex = stepOrder.indexOf(step);
  if (!force && nextIndex > furthestStep) {
    showToast('请先完成当前步骤。');
    return;
  }
  workflowPanels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === step));
  workflowSteps.forEach((button, index) => {
    button.classList.toggle('active', button.dataset.workflowStep === step);
    button.classList.toggle('done', index < nextIndex);
  });
  document.querySelector('.workflow-header').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

workflowSteps.forEach((button) => button.addEventListener('click', () => goToWorkflowStep(button.dataset.workflowStep)));
document.querySelectorAll('[data-go-step]').forEach((button) => {
  button.addEventListener('click', () => {
    const step = button.dataset.goStep;
    furthestStep = Math.max(furthestStep, stepOrder.indexOf(step));
    goToWorkflowStep(step, true);
  });
});

const uploadCards = document.querySelectorAll('.upload-card');
const uploadedFiles = new Map();
const demoFiles = {
  boundary: '上海边界数据.shp',
  residential: '上海住宅POI.shp',
  green: '上海绿地AOI.shp',
  road: '上海路网.shp',
};

const datasetProperties = {
  boundary: { name: '研究范围', geometry: 'MultiPolygon', records: '16', crs: 'EPSG:32651', fields: [['OBJECTID', 'Integer'], ['行政区', 'String'], ['Shape_Area', 'Double']] },
  residential: { name: '住宅区 / 需求点', geometry: 'Point', records: '18,770', crs: 'EPSG:32651', fields: [['OID_', 'Integer'], ['小区', 'String'], ['总户数', 'Integer'], ['所属区域', 'String']] },
  green: { name: '城市绿地 AOI', geometry: 'MultiPolygon', records: '47,628', crs: 'EPSG:32651', fields: [['OBJECTID', 'Integer'], ['NAME', 'String'], ['S_CLASS', 'String'], ['Shape_Area', 'Double']] },
  road: { name: '步行道路网络', geometry: 'MultiLineString', records: '58,696', crs: 'EPSG:32651', fields: [['OBJECTID', 'Integer'], ['Type', 'String'], ['Length', 'Double']] },
};
let selectedDatasetKey = 'boundary';

function renderDatasetProperties() {
  const properties = datasetProperties[selectedDatasetKey];
  const fileName = uploadedFiles.get(selectedDatasetKey);
  document.getElementById('propertyLayerName').textContent = properties.name;
  document.getElementById('propertyFileName').textContent = fileName || '等待上传';
  document.getElementById('propertyFileName').classList.toggle('ready', Boolean(fileName));
  document.getElementById('propertyGeometry').textContent = properties.geometry;
  document.getElementById('propertyRecords').textContent = properties.records;
  document.getElementById('propertyCrs').textContent = properties.crs;
  document.getElementById('propertyFieldCount').textContent = `${properties.fields.length} 个字段`;
  document.getElementById('propertyFieldList').innerHTML = properties.fields.map(([name, type]) => `<p><span>${name}</span><small>${type}</small></p>`).join('');
  document.querySelectorAll('[data-dataset-key]').forEach((item) => item.classList.toggle('selected', item.dataset.datasetKey === selectedDatasetKey));
}

document.querySelectorAll('[data-dataset-tab]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-dataset-tab]').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('[data-dataset-panel]').forEach((panel) => { panel.hidden = panel.dataset.datasetPanel !== button.dataset.datasetTab; });
    if (button.dataset.datasetTab === 'properties') renderDatasetProperties();
  });
});

document.querySelectorAll('[data-dataset-key]').forEach((item) => {
  item.addEventListener('click', () => {
    selectedDatasetKey = item.dataset.datasetKey;
    renderDatasetProperties();
  });
});
renderDatasetProperties();

function updateUploadState() {
  document.getElementById('uploadCounter').textContent = `${uploadedFiles.size} / 4 已就绪`;
  document.getElementById('datasetReadyCount').textContent = `${uploadedFiles.size}/4`;
  document.getElementById('toInspect').disabled = uploadedFiles.size !== 4;
}

function setUploadCard(card, fileName) {
  const key = card.dataset.uploadKey;
  uploadedFiles.set(key, fileName);
  card.classList.add('ready');
  card.querySelector('.file-state span').textContent = fileName;
  const datasetItem = document.querySelector(`[data-dataset-key="${key}"]`);
  datasetItem.classList.add('ready');
  datasetItem.querySelector('small').textContent = fileName;
  if (selectedDatasetKey === key) renderDatasetProperties();
  updateUploadState();
}

uploadCards.forEach((card) => {
  const input = card.querySelector('input[type="file"]');
  input.addEventListener('change', () => {
    if (input.files && input.files[0]) setUploadCard(card, input.files[0].name);
  });
  card.querySelector('.file-state button').addEventListener('click', () => {
    uploadedFiles.delete(card.dataset.uploadKey);
    input.value = '';
    card.classList.remove('ready');
    const datasetItem = document.querySelector(`[data-dataset-key="${card.dataset.uploadKey}"]`);
    datasetItem.classList.remove('ready');
    datasetItem.querySelector('small').textContent = '等待上传';
    if (selectedDatasetKey === card.dataset.uploadKey) renderDatasetProperties();
    updateUploadState();
  });
});

function loadShanghaiDemo() {
  document.getElementById('projectName').value = '上海市 15-15 健康绿地评估';
  document.getElementById('cityName').value = '上海市';
  uploadCards.forEach((card) => setUploadCard(card, demoFiles[card.dataset.uploadKey]));
  showToast('上海数据已载入，可以继续检查数据。');
}

document.getElementById('loadDemoData').addEventListener('click', loadShanghaiDemo);
document.getElementById('toInspect').addEventListener('click', () => {
  furthestStep = Math.max(furthestStep, 1);
  goToWorkflowStep('inspect', true);
});

document.querySelectorAll('[data-layer]').forEach((control) => {
  control.addEventListener('change', () => {
    const layer = document.getElementById(`layer-${control.dataset.layer}`);
    layer.style.opacity = control.checked ? '1' : '0';
  });
});

document.getElementById('runAnalysis').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const stages = [...document.querySelectorAll('.processing-stages > div')];
  const city = document.getElementById('cityName').value.trim() || '当前城市';
  document.getElementById('runCity').textContent = city;
  button.disabled = true;
  button.querySelector('span').textContent = '分析正在运行';
  button.querySelector('small').textContent = '请勿关闭当前页面';
  stages.forEach((stage) => stage.classList.remove('active', 'done'));
  let current = 0;
  const timer = window.setInterval(() => {
    if (current > 0) stages[current - 1].classList.remove('active');
    if (current > 0) stages[current - 1].classList.add('done');
    if (current < stages.length) {
      stages[current].classList.add('active');
      const percent = Math.round((current / stages.length) * 100);
      document.getElementById('progressBar').style.width = `${percent}%`;
      document.getElementById('progressPercent').textContent = `${percent}%`;
      document.getElementById('progressTitle').textContent = stages[current].querySelector('span').textContent;
      current += 1;
      return;
    }
    window.clearInterval(timer);
    stages.at(-1).classList.remove('active');
    stages.at(-1).classList.add('done');
    document.getElementById('progressBar').style.width = '100%';
    document.getElementById('progressPercent').textContent = '100%';
    document.getElementById('progressTitle').textContent = '分析完成';
    button.disabled = false;
    button.querySelector('span').textContent = '重新运行分析';
    button.querySelector('small').textContent = '使用当前数据与参数';
    document.getElementById('resultProjectName').textContent = `${city} 15-15 健康绿地评估`;
    document.querySelectorAll('[data-generated-layer]').forEach((layer) => {
      layer.classList.remove('disabled');
      layer.classList.add('ready');
      layer.querySelector('input').disabled = false;
      layer.querySelector('input').checked = true;
      layer.querySelector('small').textContent = '已生成';
    });
    document.getElementById('intermediateCount').textContent = '2';
    document.getElementById('outputCount').textContent = '1';
    furthestStep = 4;
    showToast('分析完成，正在打开结果与报告。');
    window.setTimeout(() => goToWorkflowStep('results', true), 500);
  }, 850);
});

let mapScale = 1;
document.querySelectorAll('.map-zoom button').forEach((button, index) => {
  button.addEventListener('click', () => {
    mapScale = Math.min(1.45, Math.max(1, mapScale + (index === 0 ? .1 : -.1)));
    document.querySelectorAll('.map-images img').forEach((image) => { image.style.transform = `scale(${mapScale})`; });
  });
});
const mapStage = document.getElementById('mapStage');
const fullscreenButton = document.getElementById('fullscreenButton');

function setMapFullscreen(isFullscreen) {
  mapStage.classList.toggle('fullscreen', isFullscreen);
  document.body.classList.toggle('map-fullscreen', isFullscreen);
  fullscreenButton.textContent = isFullscreen ? '退出全屏' : '全屏地图';
  fullscreenButton.setAttribute('aria-pressed', String(isFullscreen));
}

fullscreenButton.addEventListener('click', () => {
  setMapFullscreen(!mapStage.classList.contains('fullscreen'));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mapStage.classList.contains('fullscreen')) setMapFullscreen(false);
});
const resultTabs = document.querySelectorAll('[data-result-tab]');
resultTabs.forEach((button) => {
  button.addEventListener('click', () => {
    resultTabs.forEach((tab) => tab.classList.toggle('active', tab === button));
    document.querySelectorAll('[data-result-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.resultPanel === button.dataset.resultTab));
  });
});

function downloadBlob(fileName, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildReport() {
  const project = document.getElementById('projectName').value || '上海市 15-15 健康绿地评估';
  const city = document.getElementById('cityName').value || '上海市';
  return `<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>${project}</title><style>body{font-family:Arial,"Microsoft YaHei",sans-serif;max-width:900px;margin:50px auto;color:#18231f;line-height:1.7}h1{border-bottom:3px solid #246c55;padding-bottom:16px}table{width:100%;border-collapse:collapse;margin:24px 0}td,th{border:1px solid #dce3df;padding:10px;text-align:left}.note{background:#eef5f1;padding:16px}</style><h1>${project}</h1><p>分析区域：${city}</p><p>模型：15-15 健康绿地评估</p><h2>核心结果</h2><table><tr><th>社区达标率</th><td>78.25%</td></tr><tr><th>户数代理达标率</th><td>80.22%</td></tr><tr><th>合格绿地</th><td>4,997</td></tr><tr><th>最低有效绿地面积</th><td>1.39 ha</td></tr></table><h2>方法口径</h2><p>住宅区在 15 分钟步行范围内能够到达至少一处支持 15 分钟有效暴露的绿地，即判定为满足 15-15 规则。</p><div class="note">报告记录当前项目的分析参数、核心指标与方法口径。</div></html>`;
}

function handleDownload(type) {
  if (type === 'report') downloadBlob('15-15-analysis-report.html', buildReport(), 'text/html;charset=utf-8');
  if (type === 'residential') downloadBlob('residential-1515-results.csv', '住宅区,所属区域,步行时间,是否达标\n金龙大厦,黄浦区,9.5,是\n大木小区,徐汇区,12.4,是\n嘉定社区A,嘉定区,,否\n', 'text/csv;charset=utf-8');
  if (type === 'summary') downloadBlob('15-15-summary.json', JSON.stringify({ model: '15-15', community_meet_rate: 0.7825, household_proxy_meet_rate: 0.8022, qualified_green: 4997, required_area_ha: 1.39 }, null, 2), 'application/json');
  if (type === 'spatial') downloadBlob('spatial-data-manifest.json', JSON.stringify({ layers: ['residential_1515', 'qualified_green', 'boundary', 'road_walkable'] }, null, 2), 'application/json');
  showToast('文件已生成并开始下载。');
}

document.getElementById('downloadReport').addEventListener('click', () => handleDownload('report'));
document.querySelectorAll('[data-download]').forEach((button) => button.addEventListener('click', () => handleDownload(button.dataset.download)));
document.getElementById('newAnalysis').addEventListener('click', () => {
  furthestStep = 0;
  goToWorkflowStep('setup', true);
  showToast('已返回项目创建步骤，现有分析结果仍保留。');
});

function openModal(title, html) {
  modalTitle.textContent = title;
  modalContent.innerHTML = html;
  modalBackdrop.hidden = false;
}
document.getElementById('methodButton').addEventListener('click', () => openModal('当前计算口径', '<p>15 分钟外部步行可达 + 15 分钟有效绿地暴露。</p><ul><li>绿地目的点：AOI 几何质心</li><li>外部步行速度：4 km/h</li><li>有效绿地面积阈值：约 1.39 ha</li><li>人口需求代理：住宅总户数</li></ul>'));
document.getElementById('modalClose').addEventListener('click', () => { modalBackdrop.hidden = true; });
modalBackdrop.addEventListener('click', (event) => { if (event.target === modalBackdrop) modalBackdrop.hidden = true; });

routeTo('lab');
updateAreaThreshold();
