import React, { useState } from "react";
import {
  Volume2,
  Mic,
  Languages,
  ChevronRight,
  ArrowLeft,
  Activity,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  ArrowLeftRight,
  Database,
} from "lucide-react";
import {
  getHistoricalMatchesForPatient,
  hasHistoricalSupportForPatient,
} from "./ragEvidence";

const EMPTY_MEDICAL_DATA = {
  name: "",
  birthDate: "",
  idNumber: "",
  allergies: [],
  allergiesOther: "",
  history: [],
  historyOther: "",
  onset: "",
  onsetOther: "",
  severity: 5,
  painType: "",
  painTypeOther: "",
  painLocation: [],
  breathingDifficulty: "",
  lostConsciousness: "",
  updateOther: "",
  additionalInfo: "",
  followUpAnswer: "",
  followUpOther: ""
};

const NONE_VALUES = ["None", "無", "无", "Wala", "ਕੋਈ ਨਹੀਂ"];

const content = {
  en: {
    title: "Carebridge Triage",
    next: "Next Step",
    finish: "Show to Nurse",
    verify: "Verify and Continue",
    save: "Save Updates",
    other: "Other",
    otherPlaceholder: "Type details here",
    history: "Medical History",
    allergies: "Allergies",
    historyPrompts: ["Diabetes", "High Blood Pressure", "Heart Disease", "Asthma", "Stroke", "Other", "None"],
    allergyPrompts: ["Penicillin", "Latex", "Peanuts", "Contrast Dye", "Sulfa", "Other", "None"],
    painTypes: ["Sharp", "Dull", "Pressure", "Burning", "Cramping", "Other"],
    onsets: ["Suddenly", "Gradually", "After an injury", "Other"],
    locationLabel: "Where is the issue?",
    followUpTitle: "Focused Question",
    followUpLabel: "Based on the area you selected, answer this next question.",
    followUpSummary: "Focused Answer",
    severityLabel: "Pain Severity (0-10)",
    onsetLabel: "Onset",
    sensationLabel: "Sensation",
    locations: ["Head", "Chest", "Abdomen", "Back", "Limbs", "Skin"],
    loginTitle: "Patient Check-In",
    loginHelp: "Confirm identity before starting triage.",
    editTitle: "Clinical Update",
    editHelp: "Record symptom changes without going back through check-in.",
    updateLocationLabel: "Where is the issue now?",
    updateLostConsciousness: "Has there been any loss of consciousness?",
    updateBreathing: "Is there any difficulty breathing?",
    yes: "Yes",
    no: "No",
    updateOtherLabel: "Other important change",
    additionalInfoLabel: "Additional information",
    additionalInfoHelp: "Add anything else you want the nurse to know.",
    voiceIdle: "Voice input",
    voiceDisabled: "Voice demo disabled online",
    triageSubmitting: "Sending to triage backend...",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter patient name",
    birthDateLabel: "Date of Birth",
    idCheckLabel: "Health Card / Medical Number (Optional)",
    idScanHelp: "Optional. Emergency care is not delayed if the card is unavailable.",
    idNumberLabel: "Medical Number (Optional)",
    idNumberPlaceholder: "Enter PHN, health card, or patient ID",
    selectLanguage: "Select Language",
    selectLanguageHelp: "To provide the most accurate triage info.",
    symptomCheck: "Symptom check",
    presentImmediately: "Present this screen to the nurse immediately upon arrival.",
    status: "Status",
    location: "Location",
    painIndex: "Pain Index",
    feelingOnset: "Feeling and Onset",
    unspecified: "Unspecified",
    noneReported: "None Reported",
    clearSession: "Clear and Start New Session",
    updateInfo: "Update Your Information",
    scale: "Scale",
    painDescriptors: [
      "No pain at rest",
      "Barely noticeable, like a small bruise",
      "Minor ache, like a light headache",
      "Noticeable soreness, like a stubbed toe",
      "Steady pain, like a strong muscle cramp",
      "Hard to ignore, like a bad sprain",
      "Sharp enough to interrupt conversation",
      "Severe pain, hard to focus or sit still",
      "Very severe, limiting movement or deep breaths",
      "Overwhelming pain, close to unbearable",
      "Worst pain imaginable, needs urgent help"
    ],
    triageScore: "Triage Score",
    nurseLogin: "Login as Nurse",
    nurseDashboard: "Nurse Dashboard",
    nurseQueue: "Active Queue",
    nurseEmpty: "No patients are currently waiting in the queue.",
    nurseQueueSort: "Priority sorted by CTAS, then wait time.",
    queueNeedsInfo: "Awaiting Patient Info",
    queueNeedsInfoHelp: "Nurse request sent; waiting for patient response.",
    queueUpdated: "Patient Updates",
    queueUpdatedHelp: "Patient submitted a new status update.",
    queueWaiting: "Pending",
    queueWaitingHelp: "Needs nurse attention before placement.",
    queueReady: "In Queue",
    queueReadyHelp: "Already placed in the treatment queue.",
    patientUpdated: "Patient updated",
    close: "Close",
    workflowStatusLegend: "Workflow Status Legend",
    statusWaiting: "Waiting",
    statusWaitingHelp: "In queue, not yet opened by nurse.",
    statusNeedsInfo: "Needs info",
    statusNeedsInfoHelp: "Nurse requested a focused patient update.",
    statusReviewing: "Reviewing",
    statusReviewingHelp: "Nurse is checking facts, CTAS modifiers, and evidence.",
    statusReady: "Ready",
    statusReadyHelp: "Reviewed and ready for next clinical handoff.",
    loadDemoCases: "Load Demo Cases",
    patientView: "Patient View",
    triageOverrideTitle: "Nurse CTAS Override",
    triageOverrideHelp: "Upgrade or downgrade the CTAS level with a short clinical reason.",
    triageOverridePlaceholder: "Short reason for changing CTAS level",
    triageUpgrade: "Upgrade",
    triageDowngrade: "Downgrade",
    triageLocked: "Manual override locked",
    triageOverrideReason: "Override Reason",
    triageNurseAdjusted: "Nurse adjusted",
    ragTitle: "Historical CTAS* Confirmation",
    ragHelp: "CTAS* means the rule-based level is supported by similar labeled historical cases. It is evidence for nurse review, not an AI diagnosis.",
    ragMatchedCases: "Similar historical cases",
    ragNoMatches: "No strong historical match found yet.",
    nurseFollowUpTitle: "Request More Patient Info",
    nurseFollowUpHelp: "Send one focused question back to the patient kiosk when a detail is missing.",
    nurseFollowUpPlaceholder: "Example: When did the chest pressure start, and is it getting worse?",
    nurseFollowUpSend: "Send Request",
    nurseQuestion: "Nurse Question",
    nurseQuestionPending: "Patient response pending",
    nurseQuestionAnswered: "Patient answered",
    markWaiting: "Mark Waiting",
    markInReview: "Mark In Review",
    markReady: "Mark Ready",
    lastUpdated: "Last Updated",
    intakeMethod: "Intake Method",
    queueCount: (count) => `${count} patient case${count > 1 ? "s" : ""} in queue.`,
    triageLevel: (severity) => `${6 - Math.min(5, Math.max(1, Math.ceil((severity + 1) / 2)))}/5 TRIAGE REQ.`
  },
  zh: {
    title: "CareBridge 分诊",
    next: "下一步",
    finish: "给护士查看",
    verify: "确认并继续",
    save: "保存更新",
    other: "其他",
    otherPlaceholder: "在这里输入详情",
    history: "病史",
    allergies: "过敏史",
    historyPrompts: ["糖尿病", "高血压", "心脏病", "哮喘", "中风", "其他", "无"],
    allergyPrompts: ["青霉素", "乳胶", "花生", "造影剂", "磺胺", "其他", "无"],
    painTypes: ["刺痛", "钝痛", "压迫感", "灼烧感", "绞痛", "其他"],
    onsets: ["突然开始", "逐渐加重", "受伤后", "其他"],
    locationLabel: "哪里不舒服？",
    followUpTitle: "重点问题",
    followUpLabel: "根据你选择的位置，请回答下一题。",
    followUpSummary: "重点回答",
    severityLabel: "疼痛程度 (0-10)",
    onsetLabel: "开始时间",
    sensationLabel: "感觉",
    locations: ["头部", "胸部", "腹部", "背部", "四肢", "皮肤"],
    loginTitle: "患者登记",
    loginHelp: "开始分诊前请确认身份。",
    editTitle: "病情更新",
    editHelp: "记录症状变化，不必重新登记。",
    updateLocationLabel: "现在哪里不舒服？",
    updateLostConsciousness: "是否有意识丧失？",
    updateBreathing: "是否呼吸困难？",
    yes: "是",
    no: "否",
    updateOtherLabel: "其他重要变化",
    additionalInfoLabel: "补充说明",
    additionalInfoHelp: "还有什么想告诉护士，可以写在这里。",
    voiceIdle: "语音录入",
    voiceDisabled: "线上演示暂不启用语音转录",
    triageSubmitting: "正在发送到分诊后端...",
    fullName: "姓名",
    fullNamePlaceholder: "输入患者姓名",
    birthDateLabel: "出生日期",
    idCheckLabel: "健康卡 / 医疗号码（可选）",
    idScanHelp: "可选填写；急症护理不会因未携带卡片而延误。",
    idNumberLabel: "医疗号码（可选）",
    idNumberPlaceholder: "输入 PHN、健康卡号或患者 ID",
    selectLanguage: "选择语言",
    selectLanguageHelp: "用于提供更准确的分诊信息。",
    symptomCheck: "症状检查",
    presentImmediately: "到院后请立即把此页面给护士查看。",
    status: "状态",
    location: "位置",
    painIndex: "疼痛评分",
    feelingOnset: "感觉和开始时间",
    unspecified: "未填写",
    noneReported: "未报告",
    clearSession: "清空并重新开始",
    updateInfo: "更新信息",
    scale: "量表",
    painDescriptors: [
      "静息时无疼痛",
      "几乎感觉不到，像轻微淤青",
      "轻微酸痛，像轻度头痛",
      "明显不适，像撞到脚趾",
      "持续疼痛，像强烈肌肉抽筋",
      "难以忽略，像严重扭伤",
      "疼到影响说话",
      "剧烈疼痛，难以集中或坐稳",
      "非常剧烈，影响活动或深呼吸",
      "几乎无法忍受",
      "最严重的疼痛，需要紧急帮助"
    ],
    triageScore: "分诊等级",
    nurseLogin: "护士登录",
    nurseDashboard: "护士看板",
    nurseQueue: "当前队列",
    nurseEmpty: "当前没有患者在队列中等待。",
    nurseQueueSort: "按 CTAS 优先级排序，再按等待时间排序。",
    workflowStatusLegend: "流程状态说明",
    statusWaiting: "等待中",
    statusWaitingHelp: "已进入队列，护士尚未打开。",
    statusNeedsInfo: "需补充信息",
    statusNeedsInfoHelp: "护士已请求患者补充重点信息。",
    statusReviewing: "复核中",
    statusReviewingHelp: "护士正在核对信息、CTAS 修正因子和证据。",
    statusReady: "已就绪",
    statusReadyHelp: "已复核，可进入下一步临床交接。",
    loadDemoCases: "载入示例病例",
    patientView: "患者端",
    triageOverrideTitle: "护士 CTAS 调整",
    triageOverrideHelp: "可用简短临床理由上调或下调 CTAS 等级。",
    triageOverridePlaceholder: "输入修改 CTAS 等级的简短理由",
    triageUpgrade: "上调",
    triageDowngrade: "下调",
    triageLocked: "手动调整已锁定",
    triageOverrideReason: "调整理由",
    triageNurseAdjusted: "护士已调整",
    ragTitle: "历史 CTAS* 确认",
    ragHelp: "CTAS* 表示规则等级有相似历史标注病例支持。这是给护士复核的证据，不是 AI 诊断。",
    ragMatchedCases: "相似历史病例",
    ragNoMatches: "暂未找到强匹配历史病例。",
    nurseFollowUpTitle: "请求更多患者信息",
    nurseFollowUpHelp: "当缺少细节时，向患者终端发送一个聚焦问题。",
    nurseFollowUpPlaceholder: "例如：胸口压迫感什么时候开始？是否在加重？",
    nurseFollowUpSend: "发送请求",
    nurseQuestion: "护士问题",
    nurseQuestionPending: "等待患者回复",
    nurseQuestionAnswered: "患者已回复",
    markWaiting: "标记等待",
    markInReview: "标记复核中",
    markReady: "标记就绪",
    lastUpdated: "最后更新",
    intakeMethod: "录入方式",
    queueCount: (count) => `队列中有 ${count} 个患者病例。`,
    triageLevel: (severity) => `${6 - Math.min(5, Math.max(1, Math.ceil((severity + 1) / 2)))}/5 需要分诊`
  },
  pb: {
    title: "CareBridge ਟ੍ਰਾਇਆਜ",
    next: "ਅਗਲਾ ਕਦਮ",
    finish: "ਨਰਸ ਨੂੰ ਦਿਖਾਓ",
    verify: "ਪੁਸ਼ਟੀ ਕਰਕੇ ਜਾਰੀ ਰੱਖੋ",
    save: "ਅਪਡੇਟ ਸੰਭਾਲੋ",
    other: "ਹੋਰ",
    otherPlaceholder: "ਵੇਰਵਾ ਇੱਥੇ ਲਿਖੋ",
    history: "ਮੈਡੀਕਲ ਇਤਿਹਾਸ",
    allergies: "ਐਲਰਜੀਆਂ",
    historyPrompts: ["ਡਾਇਬਟੀਜ਼", "ਹਾਈ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ", "ਦਿਲ ਦੀ ਬਿਮਾਰੀ", "ਦਮਾ", "ਸਟ੍ਰੋਕ", "ਹੋਰ", "ਕੋਈ ਨਹੀਂ"],
    allergyPrompts: ["ਪੈਨਿਸਿਲਿਨ", "ਲੇਟੈਕਸ", "ਮੂੰਗਫਲੀ", "ਕਾਂਟ੍ਰਾਸਟ ਡਾਈ", "ਸਲਫਾ", "ਹੋਰ", "ਕੋਈ ਨਹੀਂ"],
    painTypes: ["ਤੇਜ਼", "ਮੰਦ", "ਦਬਾਅ", "ਜਲਨ", "ਮਰੋੜ", "ਹੋਰ"],
    onsets: ["ਅਚਾਨਕ", "ਹੌਲੀ-ਹੌਲੀ", "ਚੋਟ ਤੋਂ ਬਾਅਦ", "ਹੋਰ"],
    locationLabel: "ਸਮੱਸਿਆ ਕਿੱਥੇ ਹੈ?",
    followUpTitle: "ਕੇਂਦਰਿਤ ਸਵਾਲ",
    followUpLabel: "ਚੁਣੀ ਥਾਂ ਦੇ ਆਧਾਰ ਤੇ ਅਗਲਾ ਸਵਾਲ ਜਵਾਬ ਦਿਓ।",
    followUpSummary: "ਕੇਂਦਰਿਤ ਜਵਾਬ",
    severityLabel: "ਦਰਦ ਦੀ ਤੀਬਰਤਾ (0-10)",
    onsetLabel: "ਕਦੋਂ ਸ਼ੁਰੂ ਹੋਇਆ",
    sensationLabel: "ਅਹਿਸਾਸ",
    locations: ["ਸਿਰ", "ਛਾਤੀ", "ਪੇਟ", "ਪਿੱਠ", "ਬਾਂਹਾਂ/ਲੱਤਾਂ", "ਚਮੜੀ"],
    loginTitle: "ਮਰੀਜ਼ ਚੈੱਕ-ਇਨ",
    loginHelp: "ਟ੍ਰਾਇਆਜ ਸ਼ੁਰੂ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਪਛਾਣ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।",
    editTitle: "ਕਲੀਨਿਕਲ ਅਪਡੇਟ",
    editHelp: "ਚੈੱਕ-ਇਨ ਮੁੜ ਕੀਤੇ ਬਿਨਾਂ ਲੱਛਣਾਂ ਦੀ ਤਬਦੀਲੀ ਦਰਜ ਕਰੋ।",
    updateLocationLabel: "ਹੁਣ ਸਮੱਸਿਆ ਕਿੱਥੇ ਹੈ?",
    updateLostConsciousness: "ਕੀ ਬੇਹੋਸ਼ੀ ਹੋਈ ਹੈ?",
    updateBreathing: "ਕੀ ਸਾਹ ਲੈਣ ਵਿੱਚ ਮੁਸ਼ਕਲ ਹੈ?",
    yes: "ਹਾਂ",
    no: "ਨਹੀਂ",
    updateOtherLabel: "ਹੋਰ ਜ਼ਰੂਰੀ ਤਬਦੀਲੀ",
    additionalInfoLabel: "ਹੋਰ ਜਾਣਕਾਰੀ",
    additionalInfoHelp: "ਨਰਸ ਨੂੰ ਦੱਸਣ ਲਈ ਹੋਰ ਕੁਝ ਹੋਵੇ ਤਾਂ ਇੱਥੇ ਲਿਖੋ।",
    voiceIdle: "ਆਵਾਜ਼ ਨਾਲ ਭਰੋ",
    voiceDisabled: "ਆਨਲਾਈਨ ਡੈਮੋ ਵਿੱਚ ਆਵਾਜ਼ ਬੰਦ ਹੈ",
    triageSubmitting: "ਟ੍ਰਾਇਆਜ ਬੈਕਐਂਡ ਨੂੰ ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...",
    fullName: "ਪੂਰਾ ਨਾਮ",
    fullNamePlaceholder: "ਮਰੀਜ਼ ਦਾ ਨਾਮ ਲਿਖੋ",
    birthDateLabel: "ਜਨਮ ਤਾਰੀਖ",
    idCheckLabel: "ਹੈਲਥ ਕਾਰਡ / ਮੈਡੀਕਲ ਨੰਬਰ (ਚੋਣਵਾਂ)",
    idScanHelp: "ਚੋਣਵਾਂ। ਕਾਰਡ ਨਾ ਹੋਣ ਤੇ ਐਮਰਜੈਂਸੀ ਦੇਖਭਾਲ ਵਿੱਚ ਦੇਰੀ ਨਹੀਂ ਹੁੰਦੀ।",
    idNumberLabel: "ਮੈਡੀਕਲ ਨੰਬਰ (ਚੋਣਵਾਂ)",
    idNumberPlaceholder: "PHN, ਹੈਲਥ ਕਾਰਡ ਜਾਂ ਮਰੀਜ਼ ID ਲਿਖੋ",
    selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
    selectLanguageHelp: "ਸਭ ਤੋਂ ਸਹੀ ਟ੍ਰਾਇਆਜ ਜਾਣਕਾਰੀ ਲਈ।",
    symptomCheck: "ਲੱਛਣ ਜਾਂਚ",
    presentImmediately: "ਪਹੁੰਚਦੇ ਹੀ ਇਹ ਸਕ੍ਰੀਨ ਨਰਸ ਨੂੰ ਦਿਖਾਓ।",
    status: "ਹਾਲਤ",
    location: "ਥਾਂ",
    painIndex: "ਦਰਦ ਸਕੋਰ",
    feelingOnset: "ਅਹਿਸਾਸ ਅਤੇ ਸ਼ੁਰੂਆਤ",
    unspecified: "ਨਹੀਂ ਦਿੱਤਾ",
    noneReported: "ਕੁਝ ਨਹੀਂ ਦੱਸਿਆ",
    clearSession: "ਸਾਫ ਕਰਕੇ ਮੁੜ ਸ਼ੁਰੂ ਕਰੋ",
    updateInfo: "ਜਾਣਕਾਰੀ ਅਪਡੇਟ ਕਰੋ",
    scale: "ਸਕੇਲ",
    painDescriptors: [
      "ਆਰਾਮ ਵਿੱਚ ਦਰਦ ਨਹੀਂ",
      "ਬਹੁਤ ਹਲਕਾ, ਛੋਟੀ ਚੋਟ ਵਰਗਾ",
      "ਹਲਕਾ ਦਰਦ, ਹਲਕੇ ਸਿਰਦਰਦ ਵਰਗਾ",
      "ਮਹਿਸੂਸ ਹੋਣ ਵਾਲਾ ਦਰਦ",
      "ਲਗਾਤਾਰ ਦਰਦ, ਮਜ਼ਬੂਤ ਮਾਸਪੇਸ਼ੀ ਖਿੱਚ ਵਰਗਾ",
      "ਨਜ਼ਰਅੰਦਾਜ਼ ਕਰਨਾ ਔਖਾ",
      "ਗੱਲਬਾਤ ਰੋਕਣ ਜਿਤਨਾ ਤੇਜ਼",
      "ਤੀਬਰ ਦਰਦ, ਧਿਆਨ ਲਗਾਉਣਾ ਔਖਾ",
      "ਬਹੁਤ ਤੀਬਰ, ਹਿਲਣ ਜਾਂ ਡੂੰਘੇ ਸਾਹ ਵਿੱਚ ਰੁਕਾਵਟ",
      "ਲਗਭਗ ਅਸਹਿਣਯੋਗ",
      "ਸਭ ਤੋਂ ਵੱਧ ਦਰਦ, ਤੁਰੰਤ ਮਦਦ ਚਾਹੀਦੀ"
    ],
    triageScore: "ਟ੍ਰਾਇਆਜ ਸਕੋਰ",
    nurseLogin: "ਨਰਸ ਵਜੋਂ ਲਾਗਇਨ",
    nurseDashboard: "ਨਰਸ ਡੈਸ਼ਬੋਰਡ",
    nurseQueue: "ਸਰਗਰਮ ਕਤਾਰ",
    nurseEmpty: "ਇਸ ਵੇਲੇ ਕੋਈ ਮਰੀਜ਼ ਕਤਾਰ ਵਿੱਚ ਨਹੀਂ।",
    nurseQueueSort: "ਤਰਜੀਹ CTAS ਮੁਤਾਬਕ, ਫਿਰ ਉਡੀਕ ਸਮੇਂ ਮੁਤਾਬਕ।",
    workflowStatusLegend: "ਵਰਕਫਲੋ ਹਾਲਤ ਗਾਈਡ",
    statusWaiting: "ਉਡੀਕ",
    statusWaitingHelp: "ਕਤਾਰ ਵਿੱਚ ਹੈ, ਨਰਸ ਨੇ ਅਜੇ ਨਹੀਂ ਖੋਲ੍ਹਿਆ।",
    statusNeedsInfo: "ਹੋਰ ਜਾਣਕਾਰੀ",
    statusNeedsInfoHelp: "ਨਰਸ ਨੇ ਮਰੀਜ਼ ਤੋਂ ਕੇਂਦਰਿਤ ਅਪਡੇਟ ਮੰਗੀ ਹੈ।",
    statusReviewing: "ਸਮੀਖਿਆ",
    statusReviewingHelp: "ਨਰਸ ਤੱਥਾਂ, CTAS ਮੋਡੀਫਾਇਰਾਂ ਅਤੇ ਸਬੂਤ ਦੀ ਜਾਂਚ ਕਰ ਰਹੀ ਹੈ।",
    statusReady: "ਤਿਆਰ",
    statusReadyHelp: "ਸਮੀਖਿਆ ਪੂਰੀ, ਅਗਲੀ ਕਲੀਨਿਕਲ ਹੈਂਡਆਫ ਲਈ ਤਿਆਰ।",
    loadDemoCases: "ਡੈਮੋ ਕੇਸ ਲੋਡ ਕਰੋ",
    patientView: "ਮਰੀਜ਼ ਦ੍ਰਿਸ਼",
    triageOverrideTitle: "ਨਰਸ CTAS ਤਬਦੀਲੀ",
    triageOverrideHelp: "ਛੋਟੇ ਕਲੀਨਿਕਲ ਕਾਰਨ ਨਾਲ CTAS ਲੈਵਲ ਵਧਾਓ ਜਾਂ ਘਟਾਓ।",
    triageOverridePlaceholder: "CTAS ਬਦਲਣ ਦਾ ਛੋਟਾ ਕਾਰਨ",
    triageUpgrade: "ਵਧਾਓ",
    triageDowngrade: "ਘਟਾਓ",
    triageLocked: "ਮੈਨੁਅਲ ਤਬਦੀਲੀ ਲੌਕ ਹੈ",
    triageOverrideReason: "ਤਬਦੀਲੀ ਕਾਰਨ",
    triageNurseAdjusted: "ਨਰਸ ਨੇ ਬਦਲਿਆ",
    ragTitle: "ਇਤਿਹਾਸਕ CTAS* ਪੁਸ਼ਟੀ",
    ragHelp: "CTAS* ਦਾ ਮਤਲਬ ਹੈ ਕਿ ਨਿਯਮ-ਅਧਾਰਿਤ ਲੈਵਲ ਨੂੰ ਮਿਲਦੇ-ਜੁਲਦੇ ਲੇਬਲ ਕੀਤੇ ਇਤਿਹਾਸਕ ਕੇਸ ਸਹਾਰਾ ਦਿੰਦੇ ਹਨ। ਇਹ ਨਰਸ ਸਮੀਖਿਆ ਲਈ ਸਬੂਤ ਹੈ, AI ਨਿਦਾਨ ਨਹੀਂ।",
    ragMatchedCases: "ਮਿਲਦੇ-ਜੁਲਦੇ ਇਤਿਹਾਸਕ ਕੇਸ",
    ragNoMatches: "ਅਜੇ ਕੋਈ ਮਜ਼ਬੂਤ ਇਤਿਹਾਸਕ ਮੇਲ ਨਹੀਂ ਮਿਲਿਆ।",
    nurseFollowUpTitle: "ਹੋਰ ਮਰੀਜ਼ ਜਾਣਕਾਰੀ ਮੰਗੋ",
    nurseFollowUpHelp: "ਜਦੋਂ ਵੇਰਵਾ ਘੱਟ ਹੋਵੇ, ਮਰੀਜ਼ ਕਿਓਸਕ ਨੂੰ ਇੱਕ ਕੇਂਦਰਿਤ ਸਵਾਲ ਭੇਜੋ।",
    nurseFollowUpPlaceholder: "ਉਦਾਹਰਨ: ਛਾਤੀ ਦਾ ਦਬਾਅ ਕਦੋਂ ਸ਼ੁਰੂ ਹੋਇਆ, ਅਤੇ ਕੀ ਇਹ ਵੱਧ ਰਿਹਾ ਹੈ?",
    nurseFollowUpSend: "ਬੇਨਤੀ ਭੇਜੋ",
    nurseQuestion: "ਨਰਸ ਦਾ ਸਵਾਲ",
    nurseQuestionPending: "ਮਰੀਜ਼ ਦੇ ਜਵਾਬ ਦੀ ਉਡੀਕ",
    nurseQuestionAnswered: "ਮਰੀਜ਼ ਨੇ ਜਵਾਬ ਦਿੱਤਾ",
    markWaiting: "ਉਡੀਕ ਨਿਸ਼ਾਨਿਤ ਕਰੋ",
    markInReview: "ਸਮੀਖਿਆ ਨਿਸ਼ਾਨਿਤ ਕਰੋ",
    markReady: "ਤਿਆਰ ਨਿਸ਼ਾਨਿਤ ਕਰੋ",
    lastUpdated: "ਆਖਰੀ ਅਪਡੇਟ",
    intakeMethod: "ਇੰਟੇਕ ਢੰਗ",
    queueCount: (count) => `ਕਤਾਰ ਵਿੱਚ ${count} ਮਰੀਜ਼ ਕੇਸ ਹਨ।`,
    triageLevel: (severity) => `${6 - Math.min(5, Math.max(1, Math.ceil((severity + 1) / 2)))}/5 ਟ੍ਰਾਇਆਜ ਲੋੜੀਂਦਾ`
  },
  tl: {
    title: "CareBridge Triage",
    next: "Susunod",
    finish: "Ipakita sa Nars",
    verify: "I-verify at Magpatuloy",
    save: "I-save ang Update",
    other: "Iba pa",
    otherPlaceholder: "I-type ang detalye dito",
    history: "Kasaysayang Medikal",
    allergies: "Allergy",
    historyPrompts: ["Diabetes", "High Blood Pressure", "Sakit sa Puso", "Asthma", "Stroke", "Iba pa", "Wala"],
    allergyPrompts: ["Penicillin", "Latex", "Mani", "Contrast Dye", "Sulfa", "Iba pa", "Wala"],
    painTypes: ["Matulis", "Mapurol", "Parang may diin", "Mahapdi", "Pananakit na paikot", "Iba pa"],
    onsets: ["Biglaan", "Paunti-unti", "Pagkatapos ng injury", "Iba pa"],
    locationLabel: "Saan ang problema?",
    followUpTitle: "Tiyak na Tanong",
    followUpLabel: "Batay sa piniling bahagi, sagutin ang susunod na tanong.",
    followUpSummary: "Tiyak na Sagot",
    severityLabel: "Tindi ng Sakit (0-10)",
    onsetLabel: "Kailan nagsimula",
    sensationLabel: "Pakiramdam",
    locations: ["Ulo", "Dibdib", "Tiyan", "Likod", "Braso/Binti", "Balat"],
    loginTitle: "Patient Check-In",
    loginHelp: "Kumpirmahin ang pagkakakilanlan bago magsimula ang triage.",
    editTitle: "Clinical Update",
    editHelp: "I-record ang pagbabago ng sintomas nang hindi inuulit ang check-in.",
    updateLocationLabel: "Nasaan ang problema ngayon?",
    updateLostConsciousness: "May nawalan ba ng malay?",
    updateBreathing: "May hirap ba sa paghinga?",
    yes: "Oo",
    no: "Hindi",
    updateOtherLabel: "Iba pang mahalagang pagbabago",
    additionalInfoLabel: "Karagdagang impormasyon",
    additionalInfoHelp: "Ilagay dito kung may iba ka pang gustong sabihin sa nars.",
    voiceIdle: "Voice input",
    voiceDisabled: "Voice demo disabled online",
    triageSubmitting: "Ipinapadala sa triage backend...",
    fullName: "Buong Pangalan",
    fullNamePlaceholder: "Ilagay ang pangalan ng pasyente",
    birthDateLabel: "Petsa ng Kapanganakan",
    idCheckLabel: "Health Card / Medical Number (Optional)",
    idScanHelp: "Optional. Hindi maaantala ang emergency care kung wala ang card.",
    idNumberLabel: "Medical Number (Optional)",
    idNumberPlaceholder: "Ilagay ang PHN, health card, o patient ID",
    selectLanguage: "Pumili ng Wika",
    selectLanguageHelp: "Para sa mas tumpak na triage info.",
    symptomCheck: "Symptom check",
    presentImmediately: "Ipakita agad ang screen na ito sa nars pagdating.",
    status: "Status",
    location: "Lokasyon",
    painIndex: "Pain Index",
    feelingOnset: "Pakiramdam at Simula",
    unspecified: "Hindi tinukoy",
    noneReported: "Walang iniulat",
    clearSession: "Burahin at Magsimula Muli",
    updateInfo: "I-update ang Impormasyon",
    scale: "Scale",
    painDescriptors: [
      "Walang sakit habang nakapahinga",
      "Halos hindi pansin, parang maliit na pasa",
      "Banayad na kirot, parang mild headache",
      "Kapansin-pansing sakit",
      "Tuloy-tuloy na sakit, parang matinding pulikat",
      "Mahirap balewalain",
      "Sakit na nakakaistorbo sa usapan",
      "Malubhang sakit, mahirap mag-focus o umupo",
      "Napakalubha, hirap gumalaw o huminga nang malalim",
      "Halos hindi matiis",
      "Pinakamatinding sakit, kailangan ng agarang tulong"
    ],
    triageScore: "Triage Score",
    nurseLogin: "Login bilang Nars",
    nurseDashboard: "Dashboard ng Nars",
    nurseQueue: "Aktibong Queue",
    nurseEmpty: "Walang pasyente na naghihintay sa queue ngayon.",
    nurseQueueSort: "Nakaayos ang priority ayon sa CTAS, pagkatapos ay wait time.",
    workflowStatusLegend: "Workflow Status Legend",
    statusWaiting: "Naghihintay",
    statusWaitingHelp: "Nasa queue, hindi pa nabubuksan ng nars.",
    statusNeedsInfo: "Kulang ang info",
    statusNeedsInfoHelp: "Humingi ang nars ng tiyak na update mula sa pasyente.",
    statusReviewing: "Nire-review",
    statusReviewingHelp: "Tinitingnan ng nars ang facts, CTAS modifiers, at evidence.",
    statusReady: "Handa",
    statusReadyHelp: "Na-review na at handa para sa susunod na clinical handoff.",
    loadDemoCases: "I-load ang Demo Cases",
    patientView: "Patient View",
    triageOverrideTitle: "Nurse CTAS Override",
    triageOverrideHelp: "Itaas o ibaba ang CTAS level na may maikling clinical reason.",
    triageOverridePlaceholder: "Maikling dahilan sa pagbabago ng CTAS level",
    triageUpgrade: "Itaas",
    triageDowngrade: "Ibaba",
    triageLocked: "Manual override locked",
    triageOverrideReason: "Override Reason",
    triageNurseAdjusted: "Binago ng nars",
    ragTitle: "Historical CTAS* Confirmation",
    ragHelp: "Ang CTAS* ay nangangahulugang ang rule-based level ay suportado ng katulad na historical cases. Evidence ito para sa nurse review, hindi AI diagnosis.",
    ragMatchedCases: "Katulad na historical cases",
    ragNoMatches: "Wala pang malakas na historical match.",
    nurseFollowUpTitle: "Humingi ng Karagdagang Info",
    nurseFollowUpHelp: "Magpadala ng isang tiyak na tanong sa patient kiosk kapag may kulang na detalye.",
    nurseFollowUpPlaceholder: "Halimbawa: Kailan nagsimula ang chest pressure, at lumalala ba?",
    nurseFollowUpSend: "Ipadala ang Request",
    nurseQuestion: "Tanong ng Nars",
    nurseQuestionPending: "Naghihintay ng sagot ng pasyente",
    nurseQuestionAnswered: "Sumagot na ang pasyente",
    markWaiting: "Mark Waiting",
    markInReview: "Mark In Review",
    markReady: "Mark Ready",
    lastUpdated: "Huling Update",
    intakeMethod: "Intake Method",
    queueCount: (count) => `${count} patient case${count > 1 ? "s" : ""} sa queue.`,
    triageLevel: (severity) => `${6 - Math.min(5, Math.max(1, Math.ceil((severity + 1) / 2)))}/5 TRIAGE REQ.`
  }
};

const languageOptions = [
  { id: "en", label: "English", sub: "Default" },
  { id: "pb", label: "ਪੰਜਾਬੀ", sub: "Punjabi" },
  { id: "zh", label: "中文", sub: "Mandarin / Cantonese" },
  { id: "tl", label: "Tagalog", sub: "Filipino" }
];

const statusTone = {
  waiting: "bg-amber-50 text-amber-700 border-amber-200",
  "needs-info": "bg-cyan-50 text-cyan-700 border-cyan-200",
  reviewing: "bg-blue-50 text-blue-700 border-blue-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200"
};

const statusLegendItems = [
  { id: "waiting", labelKey: "statusWaiting", helpKey: "statusWaitingHelp" },
  { id: "needs-info", labelKey: "statusNeedsInfo", helpKey: "statusNeedsInfoHelp" },
  { id: "reviewing", labelKey: "statusReviewing", helpKey: "statusReviewingHelp" },
  { id: "ready", labelKey: "statusReady", helpKey: "statusReadyHelp" }
];

const queueSectionDefinitions = [
  { id: "needs-info", titleKey: "queueNeedsInfo", helpKey: "queueNeedsInfoHelp", tone: "border-cyan-200 bg-cyan-50 text-cyan-800" },
  { id: "updated", titleKey: "queueUpdated", helpKey: "queueUpdatedHelp", tone: "border-blue-200 bg-blue-50 text-blue-800" },
  { id: "waiting", titleKey: "queueWaiting", helpKey: "queueWaitingHelp", tone: "border-amber-200 bg-amber-50 text-amber-800" },
  { id: "ready", titleKey: "queueReady", helpKey: "queueReadyHelp", tone: "border-emerald-200 bg-emerald-50 text-emerald-800" }
];

const TRIAGE_ENDPOINT = import.meta.env.VITE_TRIAGE_ENDPOINT || "/api/triage";

const DEMO_CASES = [
  {
    id: "DEMO-001",
    patient: {
      ...EMPTY_MEDICAL_DATA,
      name: "Patient 1",
      birthDate: "1972-04-18",
      idNumber: "HC-1001",
      history: ["High Blood Pressure"],
      historyDisplay: ["High Blood Pressure"],
      allergies: ["None"],
      allergyDisplay: ["None"],
      onset: "Suddenly",
      onsetDisplay: "Suddenly",
      severity: 9,
      painType: "Pressure",
      painTypeDisplay: "Pressure",
      painLocation: ["Chest"],
      breathingDifficulty: "Yes",
      lostConsciousness: "No",
      followUpAnswer: "Pressure spreading to arm or jaw",
      followUpDisplay: "Pressure spreading to arm or jaw",
      updateOther: "",
      updateOtherDisplay: "",
      additionalInfo: ""
    },
    language: "en",
    triageScore: 2,
    nurseStatus: "waiting",
    updatedAt: "2026-05-08T09:10:00.000Z",
    backend: {
      ctas: {
        level: 2,
        title: "Emergent",
        modifiersApplied: [
          "Presenting complaint mapped to Cardiac features / chest pain.",
          "Chest pain with high-risk features."
        ]
      }
    }
  },
  {
    id: "DEMO-002",
    patient: {
      ...EMPTY_MEDICAL_DATA,
      name: "Patient 2",
      birthDate: "1995-11-02",
      idNumber: "HC-2002",
      history: ["Asthma"],
      historyDisplay: ["Asthma"],
      allergies: ["Peanuts"],
      allergyDisplay: ["Peanuts"],
      onset: "Gradually",
      onsetDisplay: "Gradually",
      severity: 7,
      painType: "Burning",
      painTypeDisplay: "Burning",
      painLocation: ["Chest", "Skin"],
      breathingDifficulty: "Yes",
      lostConsciousness: "No",
      followUpAnswer: "Pain with deep breathing",
      followUpDisplay: "Pain with deep breathing",
      updateOther: "Using rescue inhaler more often today.",
      updateOtherDisplay: "Using rescue inhaler more often today.",
      additionalInfo: "Feels worse when walking from the waiting area."
    },
    language: "en",
    triageScore: 3,
    nurseStatus: "reviewing",
    updatedAt: "2026-05-08T09:18:00.000Z",
    nurseFollowUpRequest: {
      question: "Has the breathing difficulty changed since check-in?",
      status: "answered",
      requestedAt: "2026-05-08T09:14:00.000Z",
      answeredAt: "2026-05-08T09:18:00.000Z",
      answer: "Using rescue inhaler more often today."
    },
    backend: {
      ctas: {
        level: 3,
        title: "Urgent",
        modifiersApplied: [
          "Presenting complaint mapped to Shortness of breath.",
          "Respiratory compromise modifier."
        ]
      }
    }
  },
  {
    id: "DEMO-003",
    patient: {
      ...EMPTY_MEDICAL_DATA,
      name: "Patient 3",
      birthDate: "2008-07-23",
      idNumber: "HC-3003",
      history: ["None"],
      historyDisplay: ["None"],
      allergies: ["Latex"],
      allergyDisplay: ["Latex"],
      onset: "After an injury",
      onsetDisplay: "After an injury",
      severity: 6,
      painType: "Sharp",
      painTypeDisplay: "Sharp",
      painLocation: ["Limbs"],
      breathingDifficulty: "No",
      lostConsciousness: "No",
      followUpAnswer: "Cannot put weight on it",
      followUpDisplay: "Cannot put weight on it",
      updateOther: "Rolled ankle during basketball.",
      updateOtherDisplay: "Rolled ankle during basketball.",
      additionalInfo: "Pain is mainly on the outside of the ankle."
    },
    language: "en",
    triageScore: 4,
    nurseStatus: "waiting",
    updatedAt: "2026-05-08T09:26:00.000Z",
    backend: {
      ctas: {
        level: 4,
        title: "Less urgent",
        modifiersApplied: [
          "Presenting complaint mapped to Limb pain / minor limb injury."
        ]
      }
    }
  },
  {
    id: "DEMO-004",
    patient: {
      ...EMPTY_MEDICAL_DATA,
      name: "Patient 4",
      birthDate: "1986-01-14",
      idNumber: "HC-4004",
      history: ["Diabetes"],
      historyDisplay: ["Diabetes"],
      allergies: ["Sulfa"],
      allergyDisplay: ["Sulfa"],
      onset: "Suddenly",
      onsetDisplay: "Suddenly",
      severity: 8,
      painType: "Dull",
      painTypeDisplay: "Dull",
      painLocation: ["Head"],
      breathingDifficulty: "No",
      lostConsciousness: "Yes",
      followUpAnswer: "Dizziness or faint feeling",
      followUpDisplay: "Dizziness or faint feeling",
      updateOther: "Brief blackout at home before arrival.",
      updateOtherDisplay: "Brief blackout at home before arrival.",
      additionalInfo: "Family says the patient seemed confused for a minute."
    },
    language: "en",
    triageScore: 2,
    nurseStatus: "waiting",
    updatedAt: "2026-05-08T09:31:00.000Z",
    backend: {
      ctas: {
        level: 2,
        title: "Emergent",
        modifiersApplied: [
          "Presenting complaint mapped to Stroke-like neurologic complaint.",
          "Altered mental status."
        ]
      }
    }
  },
  {
    id: "DEMO-005",
    patient: {
      ...EMPTY_MEDICAL_DATA,
      name: "Patient 5",
      birthDate: "1961-09-30",
      idNumber: "HC-5005",
      history: ["Heart Disease", "Other"],
      historyOther: "Prior bypass surgery",
      historyDisplay: ["Heart Disease", "Prior bypass surgery"],
      allergies: ["Contrast Dye"],
      allergyDisplay: ["Contrast Dye"],
      onset: "Gradually",
      onsetDisplay: "Gradually",
      severity: 5,
      painType: "Cramping",
      painTypeDisplay: "Cramping",
      painLocation: ["Abdomen", "Back"],
      breathingDifficulty: "No",
      lostConsciousness: "No",
      followUpAnswer: "Sharp pain in one spot",
      followUpDisplay: "Sharp pain in one spot",
      updateOther: "Pain worsened after breakfast.",
      updateOtherDisplay: "Pain worsened after breakfast.",
      additionalInfo: "Nausea comes in waves."
    },
    language: "en",
    triageScore: 3,
    nurseStatus: "ready",
    updatedAt: "2026-05-08T09:40:00.000Z",
    nurseFollowUpRequest: {
      question: "Did the abdominal pain change after eating or moving?",
      status: "answered",
      requestedAt: "2026-05-08T09:35:00.000Z",
      answeredAt: "2026-05-08T09:40:00.000Z",
      answer: "Pain worsened after breakfast."
    },
    backend: {
      ctas: {
        level: 3,
        title: "Urgent",
        modifiersApplied: [
          "Presenting complaint mapped to Abdominal or pelvic pain.",
          "Abdominal complaint with moderate pain or high-risk GI features."
        ]
      }
    }
  }
];

const demoQueuePlan = [
  { prefix: "INFO", count: 3, status: "needs-info", requestStatus: "open", label: "Awaiting info" },
  { prefix: "UPD", count: 3, status: "waiting", requestStatus: "answered", label: "Patient update" },
  { prefix: "PEND", count: 3, status: "waiting", requestStatus: null, label: "Pending" },
  { prefix: "QUEUE", count: 10, status: "ready", requestStatus: null, label: "In queue" }
];

const demoCaseTitles = [
  "Chest pressure",
  "Breathing difficulty",
  "Ankle injury",
  "Fainting / head symptoms",
  "Abdominal pain"
];

function makeNurseDemoCases() {
  const now = new Date("2026-05-08T10:00:00.000Z").getTime();
  let sequence = 0;

  return demoQueuePlan.flatMap((group) =>
    Array.from({ length: group.count }, (_, index) => {
      const base = DEMO_CASES[sequence % DEMO_CASES.length];
      const caseItem = JSON.parse(JSON.stringify(base));
      const triageScore = [2, 3, 4, 3, 5][sequence % 5];
      const timestamp = new Date(now - sequence * 6 * 60 * 1000).toISOString();
      sequence += 1;

      caseItem.id = `${group.prefix}-${String(index + 1).padStart(3, "0")}`;
      caseItem.patient.name = demoCaseTitles[(sequence - 1) % demoCaseTitles.length] || group.label;
      caseItem.triageScore = triageScore;
      caseItem.nurseStatus = group.status;
      caseItem.updatedAt = timestamp;
      caseItem.backend = {
        ...caseItem.backend,
        ctas: {
          ...(caseItem.backend?.ctas || {}),
          level: triageScore,
          title: triageScore <= 2 ? "Emergent" : triageScore === 3 ? "Urgent" : triageScore === 4 ? "Less urgent" : "Non urgent"
        }
      };

      if (group.requestStatus === "open") {
        caseItem.nurseFollowUpRequest = {
          question: "Please update current symptoms at the kiosk.",
          status: "open",
          requestedAt: timestamp
        };
        caseItem.patient.updateOther = "";
        caseItem.patient.updateOtherDisplay = "";
      } else if (group.requestStatus === "answered") {
        caseItem.nurseFollowUpRequest = {
          question: "Has anything changed since check-in?",
          status: "answered",
          requestedAt: new Date(new Date(timestamp).getTime() - 4 * 60 * 1000).toISOString(),
          answeredAt: timestamp,
          answer: "Patient reports symptoms changed while waiting."
        };
        caseItem.patient.updateOther = "Patient reports symptoms changed while waiting.";
        caseItem.patient.updateOtherDisplay = "Patient reports symptoms changed while waiting.";
      } else {
        caseItem.nurseFollowUpRequest = null;
        caseItem.patient.updateOther = "";
        caseItem.patient.updateOtherDisplay = "";
      }

      return caseItem;
    })
  );
}

const followUpByLocation = {
  Head: {
    question: "Which head symptom fits best?",
    options: ["Sudden severe headache", "Dizziness or faint feeling", "Blurred vision", "Mild steady headache", "Other"]
  },
  Chest: {
    question: "Which chest symptom fits best?",
    options: ["Pressure spreading to arm or jaw", "Pain with deep breathing", "Fast heartbeat or pounding", "Mild soreness with movement", "Other"]
  },
  Abdomen: {
    question: "Which stomach or abdomen symptom fits best?",
    options: ["Nausea or vomiting", "Sharp pain in one spot", "Cramping that comes and goes", "Bloated or burning feeling", "Other"]
  },
  Back: {
    question: "Which back symptom fits best?",
    options: ["Pain shooting down a leg", "Stiffness after lifting", "Mid-back ache with breathing", "Lower back spasm", "Other"]
  },
  Limbs: {
    question: "Which arm or leg symptom fits best?",
    options: ["Numbness or tingling", "Swelling after injury", "Cannot put weight on it", "Muscle ache or cramp", "Other"]
  },
  Skin: {
    question: "Which skin symptom fits best?",
    options: ["New spreading rash", "Burning or blistering", "Cut that will not stop bleeding", "Itching or irritation", "Other"]
  },
  Everywhere: {
    question: "Which whole-body symptom fits best?",
    options: ["Fever or chills", "Weakness all over", "Widespread body aches", "Shortness of breath with fatigue", "Other"]
  }
};

Object.assign(followUpByLocation, {
  "头部": {
    question: "哪种头部症状最符合？",
    options: ["突然剧烈头痛", "头晕或快晕倒", "视力模糊", "轻微持续头痛", "其他"]
  },
  "胸部": {
    question: "哪种胸部症状最符合？",
    options: ["压迫感传到手臂或下巴", "深呼吸时疼痛", "心跳很快或心悸", "活动时轻微酸痛", "其他"]
  },
  "腹部": {
    question: "哪种胃部或腹部症状最符合？",
    options: ["恶心或呕吐", "某处尖锐疼痛", "一阵一阵绞痛", "胀气或灼烧感", "其他"]
  },
  "背部": {
    question: "哪种背部症状最符合？",
    options: ["疼痛放射到腿", "搬东西后僵硬", "呼吸时中背部疼", "下背部痉挛", "其他"]
  },
  "四肢": {
    question: "哪种手臂或腿部症状最符合？",
    options: ["麻木或刺痛", "受伤后肿胀", "不能承重", "肌肉酸痛或抽筋", "其他"]
  },
  "皮肤": {
    question: "哪种皮肤症状最符合？",
    options: ["新出现并扩散的皮疹", "灼烧或起泡", "伤口止不住血", "瘙痒或刺激", "其他"]
  },
  "ਸਿਰ": {
    question: "ਕਿਹੜਾ ਸਿਰ ਦਾ ਲੱਛਣ ਸਭ ਤੋਂ ਮਿਲਦਾ ਹੈ?",
    options: ["ਅਚਾਨਕ ਤੀਬਰ ਸਿਰਦਰਦ", "ਚੱਕਰ ਜਾਂ ਬੇਹੋਸ਼ੀ ਵਰਗਾ", "ਧੁੰਦਲੀ ਨਜ਼ਰ", "ਹਲਕਾ ਲਗਾਤਾਰ ਸਿਰਦਰਦ", "ਹੋਰ"]
  },
  "ਛਾਤੀ": {
    question: "ਕਿਹੜਾ ਛਾਤੀ ਦਾ ਲੱਛਣ ਸਭ ਤੋਂ ਮਿਲਦਾ ਹੈ?",
    options: ["ਦਬਾਅ ਬਾਂਹ ਜਾਂ ਜਬੜੇ ਵੱਲ ਫੈਲਦਾ", "ਡੂੰਘੇ ਸਾਹ ਨਾਲ ਦਰਦ", "ਤੇਜ਼ ਧੜਕਣ", "ਹਿਲਣ ਨਾਲ ਹਲਕਾ ਦਰਦ", "ਹੋਰ"]
  },
  "ਪੇਟ": {
    question: "ਕਿਹੜਾ ਪੇਟ ਦਾ ਲੱਛਣ ਸਭ ਤੋਂ ਮਿਲਦਾ ਹੈ?",
    options: ["ਮਤਲੀ ਜਾਂ ਉਲਟੀ", "ਇੱਕ ਥਾਂ ਤੇਜ਼ ਦਰਦ", "ਆਉਂਦਾ-ਜਾਂਦਾ ਮਰੋੜ", "ਫੁੱਲਣਾ ਜਾਂ ਜਲਨ", "ਹੋਰ"]
  },
  "ਪਿੱਠ": {
    question: "ਕਿਹੜਾ ਪਿੱਠ ਦਾ ਲੱਛਣ ਸਭ ਤੋਂ ਮਿਲਦਾ ਹੈ?",
    options: ["ਦਰਦ ਲੱਤ ਵੱਲ ਜਾਂਦਾ", "ਚੁੱਕਣ ਤੋਂ ਬਾਅਦ ਅਕੜਨ", "ਸਾਹ ਨਾਲ ਮੱਧ ਪਿੱਠ ਦਰਦ", "ਹੇਠਲੀ ਪਿੱਠ ਖਿੱਚ", "ਹੋਰ"]
  },
  "ਬਾਂਹਾਂ/ਲੱਤਾਂ": {
    question: "ਕਿਹੜਾ ਬਾਂਹ ਜਾਂ ਲੱਤ ਦਾ ਲੱਛਣ ਸਭ ਤੋਂ ਮਿਲਦਾ ਹੈ?",
    options: ["ਸੁੰਨਪਨ ਜਾਂ ਚੁਭਨ", "ਚੋਟ ਤੋਂ ਬਾਅਦ ਸੋਜ", "ਭਾਰ ਨਹੀਂ ਪਾ ਸਕਦਾ", "ਮਾਸਪੇਸ਼ੀ ਦਰਦ ਜਾਂ ਖਿੱਚ", "ਹੋਰ"]
  },
  "ਚਮੜੀ": {
    question: "ਕਿਹੜਾ ਚਮੜੀ ਦਾ ਲੱਛਣ ਸਭ ਤੋਂ ਮਿਲਦਾ ਹੈ?",
    options: ["ਨਵੀਂ ਫੈਲਦੀ ਰੈਸ਼", "ਜਲਨ ਜਾਂ ਛਾਲੇ", "ਕੱਟ ਜੋ ਖੂਨ ਨਹੀਂ ਰੋਕਦਾ", "ਖੁਜਲੀ ਜਾਂ ਜਲਣ", "ਹੋਰ"]
  },
  "Ulo": {
    question: "Aling sintomas sa ulo ang pinaka-angkop?",
    options: ["Biglaang matinding sakit ng ulo", "Pagkahilo o parang hihimatayin", "Malabong paningin", "Banayad na tuloy-tuloy na sakit ng ulo", "Iba pa"]
  },
  "Dibdib": {
    question: "Aling sintomas sa dibdib ang pinaka-angkop?",
    options: ["Diin na kumakalat sa braso o panga", "Sakit kapag humihinga nang malalim", "Mabilis o malakas na tibok", "Banayad na kirot kapag gumagalaw", "Iba pa"]
  },
  "Tiyan": {
    question: "Aling sintomas sa tiyan ang pinaka-angkop?",
    options: ["Pagduduwal o pagsusuka", "Matulis na sakit sa isang bahagi", "Pananakit na pabalik-balik", "Kabag o mahapding pakiramdam", "Iba pa"]
  },
  "Likod": {
    question: "Aling sintomas sa likod ang pinaka-angkop?",
    options: ["Sakit na bumababa sa binti", "Pananakit pagkatapos magbuhat", "Sakit sa gitnang likod kapag humihinga", "Pulikat sa ibabang likod", "Iba pa"]
  },
  "Braso/Binti": {
    question: "Aling sintomas sa braso o binti ang pinaka-angkop?",
    options: ["Pamamanhid o tusok-tusok", "Pamamaga pagkatapos ng injury", "Hindi makatapak o makabigat", "Pananakit o pulikat ng kalamnan", "Iba pa"]
  },
  "Balat": {
    question: "Aling sintomas sa balat ang pinaka-angkop?",
    options: ["Bagong pantal na kumakalat", "Mahapdi o may paltos", "Sugatan na hindi tumitigil ang dugo", "Pangangati o iritasyon", "Iba pa"]
  }
});

const evidenceCards = [
  {
    icon: ClipboardList,
    value: "16.1M+",
    label: "Unscheduled ED visits",
    body: "reported in Canada in 2024–2025.",
    source: "CIHI NACRS",
    href: "https://www.cihi.ca/en/nacrs-emergency-department-visits-and-lengths-of-stay"
  },
  {
    icon: Activity,
    value: "48.5h",
    label: "90th percentile ED stay",
    body: "for admitted patients before leaving the ED.",
    source: "CIHI",
    href: "https://www.cihi.ca/en/nacrs-emergency-department-visits-and-lengths-of-stay"
  },
  {
    icon: Languages,
    value: "42.4%",
    label: "Non-official mother tongue",
    body: "in the Vancouver census metropolitan area.",
    source: "Statistics Canada",
    href: "https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/details/page.cfm?DGUIDlist=2021S0503933&GENDERlist=1%2C2%2C3&HEADERlist=%2C15%2C13%2C18%2C12%2C16%2C14%2C17&LANG=E&STATISTIClist=1%2C4&SearchText=vancouver"
  },
  {
    icon: ShieldAlert,
    value: "FIPPA",
    label: "Privacy duty",
    body: "BC public bodies must protect personal information.",
    source: "BC Gov",
    href: "https://www2.gov.bc.ca/gov/content/governments/services-for-government/policies-procedures/foippa-manual/protection-personal-information"
  }
];

function SafetyBoundarySvg() {
  const nodes = [
    {
      x: 74,
      y: 174,
      title: "Patient language",
      line1: "Own words",
      line2: "guided prompts",
      accent: "#67E8F9"
    },
    {
      x: 344,
      y: 174,
      title: "Gemma 4 JSON",
      line1: "Extract facts",
      line2: "clean schema",
      accent: "#22D3EE"
    },
    {
      x: 614,
      y: 174,
      title: "CTAS rules",
      line1: "Fixed modifiers",
      line2: "assign level",
      accent: "#FB7185"
    },
    {
      x: 884,
      y: 174,
      title: "Nurse dashboard",
      line1: "Review/override",
      line2: "next action",
      accent: "#FDE68A"
    }
  ];

  return (
    <div className="mt-10 overflow-hidden rounded-[3rem] border border-white bg-slate-950 p-4 shadow-2xl shadow-slate-300">
      <svg
        className="h-auto w-full"
        viewBox="0 0 1200 520"
        role="img"
        aria-label="Safety boundary: patient language goes to Gemma 4 JSON extraction, then CTAS rules, then nurse dashboard"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="boundaryGlow" cx="50%" cy="45%" r="75%">
            <stop offset="0%" stopColor="#155E75" stopOpacity="0.7" />
            <stop offset="45%" stopColor="#4A0E1D" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="boundaryLine" x1="105" y1="260" x2="1095" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67E8F9" />
            <stop offset="0.5" stopColor="#F43F5E" />
            <stop offset="1" stopColor="#FDE68A" />
          </linearGradient>
          <linearGradient id="boundaryWine" x1="400" y1="72" x2="800" y2="438" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5B1022" />
            <stop offset="0.55" stopColor="#8F1D3A" />
            <stop offset="1" stopColor="#C46A55" />
          </linearGradient>
          <filter id="boundarySoftShadow" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="22" stdDeviation="22" floodColor="#020617" floodOpacity="0.35" />
          </filter>
          <filter id="boundaryNeon" x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="boundaryArrow" markerWidth="14" markerHeight="14" refX="11" refY="7" orient="auto">
            <path d="M1 1L12 7L1 13Z" fill="#F8FAFC" />
          </marker>
        </defs>

        <rect x="0" y="0" width="1200" height="520" rx="44" fill="url(#boundaryGlow)" />
        <circle cx="216" cy="92" r="160" fill="#0891B2" opacity="0.18" />
        <circle cx="978" cy="418" r="190" fill="#BE123C" opacity="0.2" />
        <path d="M84 314C278 162 416 164 600 260C784 356 922 358 1116 206" stroke="#F8FAFC" strokeOpacity="0.14" strokeWidth="38" strokeLinecap="round" />
        <path
          id="boundaryMotionPath"
          d="M110 260C294 124 430 132 600 260C770 388 906 396 1090 260"
          stroke="url(#boundaryLine)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="18 18"
          markerEnd="url(#boundaryArrow)"
          filter="url(#boundaryNeon)"
        >
          <animate attributeName="stroke-dashoffset" values="0;-72" dur="5s" repeatCount="indefinite" />
        </path>

        <circle r="6" fill="#67E8F9" filter="url(#boundaryNeon)">
          <animateMotion dur="5.5s" repeatCount="indefinite" path="M110 260C294 124 430 132 600 260C770 388 906 396 1090 260" />
        </circle>
        <circle r="5" fill="#FDE68A" filter="url(#boundaryNeon)">
          <animateMotion begin="1.8s" dur="5.5s" repeatCount="indefinite" path="M110 260C294 124 430 132 600 260C770 388 906 396 1090 260" />
        </circle>

        <rect x="430" y="74" width="340" height="58" rx="24" fill="url(#boundaryWine)" filter="url(#boundarySoftShadow)" />
        <text x="600" y="111" textAnchor="middle" fill="#FFE4E6" fontSize="16" fontWeight="800" letterSpacing="7">
          SAFETY BOUNDARY
        </text>

        {nodes.map((node, index) => (
          <g key={node.title} filter="url(#boundarySoftShadow)">
            <rect x={node.x} y={node.y} width="242" height="188" rx="34" fill="#FFFFFF" fillOpacity="0.94" stroke={node.accent} strokeOpacity="0.55" strokeWidth="2" />
            <circle cx={node.x + 42} cy={node.y + 42} r="20" fill={node.accent} fillOpacity="0.18" />
            <text x={node.x + 42} y={node.y + 49} textAnchor="middle" fill="#0F172A" fontSize="18" fontWeight="900">
              {index + 1}
            </text>
            <text x={node.x + 28} y={node.y + 90} fill="#020617" fontSize="23" fontWeight="900">
              {node.title}
            </text>
            <text x={node.x + 28} y={node.y + 125} fill="#475569" fontSize="17" fontWeight="700">
              {node.line1}
            </text>
            <text x={node.x + 28} y={node.y + 153} fill="#475569" fontSize="17" fontWeight="700">
              {node.line2}
            </text>
          </g>
        ))}

        <g filter="url(#boundarySoftShadow)">
          <rect x="170" y="374" width="860" height="118" rx="34" fill="#FFFFFF" fillOpacity="0.96" />
          <rect x="212" y="410" width="56" height="56" rx="18" fill="#ECFEFF" />
          <text x="240" y="448" textAnchor="middle" fill="#0E7490" fontSize="30" fontWeight="900">
            ↔
          </text>
          <text x="296" y="414" fill="#94A3B8" fontSize="12" fontWeight="900" letterSpacing="6">
            DYNAMIC REASSESSMENT
          </text>
          <text x="296" y="450" fill="#020617" fontSize="25" fontWeight="900">
            Patients can update changes.
          </text>
          <text x="296" y="478" fill="#475569" fontSize="16" fontWeight="800">
            Worsening symptoms re-run CTAS and refresh the nurse queue.
          </text>
        </g>
      </svg>
    </div>
  );
}

function WriteUpPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#f4f8fb] text-slate-950">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/70 bg-white/80 px-6 py-4 shadow-sm backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-300">
              <Activity size={20} />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight">CareBridge</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Canada</div>
            </div>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex">
            <a href="#why" className="hover:text-slate-950">Why</a>
            <a href="#gemma" className="hover:text-slate-950">Why Gemma 4</a>
            <a href="#rag" className="hover:text-slate-950">CTAS*</a>
            <a href="#validation" className="hover:text-slate-950">Validation</a>
          </nav>
          <a
            href="/"
            className="rounded-full bg-gradient-to-r from-[#5b1022] via-[#8f1d3a] to-[#c46a55] px-5 py-3 text-sm font-black text-white shadow-xl shadow-rose-200/70 ring-1 ring-white/40 transition hover:-translate-y-0.5 hover:shadow-rose-300/80"
          >
            Open demo
          </a>
        </div>
      </header>

      <main className="pt-24">
        <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(245,158,11,0.18),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef5f8_100%)]" />
          <div>
            <p className="mb-5 text-xs font-black uppercase tracking-[0.42em] text-cyan-700">Built for Kaggle Gemma 4 Good Hackathon</p>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 md:text-6xl lg:text-7xl">
              Triage that listens first, then follows rules.
            </h1>
            <p className="mt-7 max-w-2xl text-lg font-medium leading-8 text-slate-600">
              Built from Vancouver for Canadian emergency care: Gemma 4 converts patient language into structured facts, then a CTAS-aligned engine turns those facts into a transparent nurse-facing priority.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Gemma 4 extraction", "CTAS-aligned rules", "Vercel demo + hospital-network mode"].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2.7rem] bg-gradient-to-br from-white via-sky-50 to-rose-50 p-3 shadow-2xl shadow-slate-300 ring-1 ring-white">
            <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-cyan-200/50 via-white to-amber-200/50 blur-2xl" />
            <img
              src="/carebridge-hero.png"
              alt="CareBridge clinic kiosk and nurse dashboard"
              className="cb-float relative aspect-[1.777] w-full rounded-[2.2rem] object-contain"
            />
          </div>
        </section>

        <section id="why" className="mx-auto -mt-4 max-w-7xl px-6">
          <div className="rounded-[3rem] border border-white bg-white/85 p-5 shadow-2xl shadow-slate-200/80 backdrop-blur-xl">
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[2.4rem] bg-gradient-to-br from-[#4a0e1d] via-[#8f1d3a] to-[#c46a55] p-8 text-white">
                <p className="text-xs font-black uppercase tracking-[0.42em] text-rose-100">Why this product</p>
                <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
                  The front door is under pressure.
                </h2>
                <p className="mt-5 text-base font-medium leading-8 text-rose-50/90">
                  CareBridge starts where ER bottlenecks, language barriers, and privacy constraints collide: patient intake.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {evidenceCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <a
                      key={card.label}
                      href={card.href}
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-[2rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-3xl font-black tracking-[-0.05em] text-slate-950">{card.value}</div>
                          <h3 className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-slate-800">{card.label}</h3>
                        </div>
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-[#8f1d3a] transition group-hover:bg-[#8f1d3a] group-hover:text-white">
                          <Icon size={21} />
                        </div>
                      </div>
                      <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{card.body}</p>
                      <span className="mt-4 inline-flex text-[10px] font-black uppercase tracking-[0.22em] text-[#8f1d3a]">
                        {card.source}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="gemma" className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid items-end gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.42em] text-cyan-700">Why Gemma 4</p>
              <h2 className="mt-4 text-5xl font-black leading-tight tracking-[-0.05em] md:text-6xl">
                Gemma is the interpreter. The rules stay in charge.
              </h2>
            </div>
            <p className="text-xl font-medium leading-9 text-slate-600">
              A generic chatbot is the wrong tool for triage. Gemma 4 is constrained to multilingual extraction; the medical priority remains deterministic and nurse-reviewed.
            </p>
          </div>
          <SafetyBoundarySvg />
        </section>

        <section id="rag" className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid items-stretch gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[3rem] bg-gradient-to-br from-[#4a0e1d] via-[#8f1d3a] to-[#c46a55] p-10 text-white shadow-2xl shadow-rose-200/60">
              <p className="text-xs font-black uppercase tracking-[0.42em] text-rose-100">RAG-inspired confirmation</p>
              <h2 className="mt-4 text-5xl font-black leading-tight tracking-[-0.05em]">
                CTAS* means rules plus historical evidence.
              </h2>
              <p className="mt-6 text-lg font-medium leading-9 text-rose-50/90">
                After CTAS-aligned rules assign a level, CareBridge searches known labeled cases for similar symptoms, pain context, and red flags. Matching cases are shown to nurses as confirmation evidence.
              </p>
            </div>
            <div className="rounded-[3rem] border border-white bg-white p-8 shadow-2xl shadow-slate-200/70">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Database size={24} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.35em] text-slate-400">Nurse portal evidence</p>
                  <h3 className="text-2xl font-black text-slate-950">Historical examples, not hidden decisions.</h3>
                </div>
              </div>
              <div className="mt-6 grid gap-4">
                {[
                  ["CTAS 2*", "Chest pressure + arm radiation matched emergent historical cases."],
                  ["CTAS 3*", "Breathing difficulty with asthma history matched urgent cases."],
                  ["CTAS 4*", "Stable isolated limb injury matched less-urgent cases."]
                ].map(([level, body]) => (
                  <div key={level} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <div className="text-2xl font-black text-slate-950">{level}</div>
                    <p className="mt-2 text-base font-semibold leading-7 text-slate-600">{body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-sm font-bold leading-7 text-slate-500">
                The star does not mean automation overrules clinical judgment. It means the nurse can inspect similar labeled cases before confirming, upgrading, or downgrading.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <article className="cb-fade-up grid items-center gap-8 rounded-[3rem] border border-white bg-white p-5 shadow-2xl shadow-slate-200/70 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-[2.5rem] bg-slate-100">
              <img
                src="/carebridge-photo-hospital-network.png"
                alt="CareBridge kiosk connected to an on-prem hospital network and nurse dashboard"
                className="aspect-[1.22] h-full w-full object-cover transition duration-700 hover:scale-105"
              />
            </div>
            <div className="px-3 py-8 md:px-10">
              <p className="text-xs font-black uppercase tracking-[0.42em] text-amber-600">Hospital network</p>
              <h3 className="mt-4 text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
                Private does not mean disconnected.
              </h3>
              <p className="mt-6 text-lg font-medium leading-9 text-slate-600">
                The kiosk sends intake to nurses inside the hospital environment. The promise is no public-cloud patient upload in on-prem mode.
              </p>
            </div>
          </article>
        </section>

        <section id="validation" className="bg-white py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2.5rem] bg-[#eef6f8] p-8 shadow-inner">
              <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl shadow-slate-300">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-200">Benchmark signal</p>
                <div className="mt-8 grid gap-4">
                  <div className="rounded-3xl bg-white/10 p-6">
                    <div className="text-6xl font-black">75%</div>
                    <p className="mt-2 font-bold text-slate-300">Exact accuracy on the optimized 500-case KTAS replay.</p>
                  </div>
                  <div className="rounded-3xl bg-white/10 p-6">
                    <div className="text-6xl font-black">97%</div>
                    <p className="mt-2 font-bold text-slate-300">Within one acuity level, showing broad ordinal alignment.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-xs font-black uppercase tracking-[0.42em] text-amber-600">Measured, not magical</p>
              <h2 className="mt-4 text-5xl font-black leading-tight tracking-[-0.05em] md:text-6xl">
                Validation signal.
              </h2>
              <p className="mt-6 text-xl font-medium leading-9 text-slate-600">
                We replayed KTAS-labeled emergency cases through the same extraction-and-rule pipeline and reported the misses openly.
              </p>
              <div className="mt-8 space-y-4">
                {["Gemma output is inspectable JSON.", "Every CTAS decision includes modifiers.", "Nurses can see the reasoning instead of trusting a black box."].map((item) => (
                  <div key={item} className="flex items-center gap-4 text-lg font-bold text-slate-700">
                    <CheckCircle2 className="text-emerald-600" size={23} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="rounded-[3rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-10 text-white shadow-2xl shadow-slate-300 md:p-16">
            <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.42em] text-cyan-200">Built for the waiting room</p>
                <h2 className="mt-4 text-5xl font-black leading-tight tracking-[-0.05em] md:text-6xl">
                  A calmer front desk. A clearer board for nurses.
                </h2>
              </div>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5b1022] via-[#8f1d3a] to-[#c46a55] px-7 py-4 text-base font-black text-white shadow-xl shadow-rose-950/30 transition hover:-translate-y-0.5 hover:shadow-rose-900/40"
              >
                Try the demo
                <ChevronRight className="ml-2" size={20} />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function App() {
  if (window.location.pathname === "/write-up") {
    return <WriteUpPage />;
  }

  const [lang, setLang] = useState(null);
  const [step, setStep] = useState("language");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [medicalData, setMedicalData] = useState(EMPTY_MEDICAL_DATA);
  const [view, setView] = useState("patient");
  const [cases, setCases] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [isSubmittingTriage, setIsSubmittingTriage] = useState(false);
  const [triageError, setTriageError] = useState("");
  const [triageOverrideDrafts, setTriageOverrideDrafts] = useState({});
  const [nurseQuestionDrafts, setNurseQuestionDrafts] = useState({});
  const [selectedQueueSectionId, setSelectedQueueSectionId] = useState(null);
  const [expandedQueueSections, setExpandedQueueSections] = useState({});
  const [voiceDisplayValues, setVoiceDisplayValues] = useState({});

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
  const t = view === "nurse" ? content.en : lang && content[lang] ? { ...content.en, ...content[lang] } : content.en;
  const activeCase = cases.find((item) => item.id === activeCaseId) || null;
  const activeNurseRequest =
    activeCase?.nurseFollowUpRequest?.status === "open" ? activeCase.nurseFollowUpRequest : null;
  const sortedCases = [...cases].sort((a, b) => {
    if (a.triageScore !== b.triageScore) {
      return a.triageScore - b.triageScore;
    }
    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
  });
  const hasPatientUpdate = (caseItem) =>
    caseItem.nurseFollowUpRequest?.status === "answered" || Boolean(caseItem.patient?.updateOtherDisplay);
  const getQueueSectionId = (caseItem) => {
    if (caseItem.nurseStatus === "ready") return "ready";
    if (caseItem.nurseStatus === "needs-info" && caseItem.nurseFollowUpRequest?.status === "open") return "needs-info";
    if (hasPatientUpdate(caseItem)) return "updated";
    return "waiting";
  };
  const queueSections = queueSectionDefinitions.map((section) => ({
    ...section,
    cases: sortedCases.filter((caseItem) => getQueueSectionId(caseItem) === section.id)
  }));
  const selectedQueueSection = queueSections.find((section) => section.id === selectedQueueSectionId) || null;
  const selectedLocations = medicalData.painLocation;
  const followUpLocations = selectedLocations.length > 0 ? selectedLocations : ["Head"];
  const followUpQuestion =
    followUpLocations.length === 1
      ? followUpByLocation[followUpLocations[0]]?.question || "Which symptom best matches what you feel?"
      : `Which symptom matters most right now for ${followUpLocations.join(", ")}?`;
  const followUpOptions = Array.from(
    new Set(
      followUpLocations.flatMap((location) => followUpByLocation[location]?.options || []).concat(["Other"])
    )
  );

  const getTriageScore = (severity) => 6 - Math.min(5, Math.max(1, Math.ceil((severity + 1) / 2)));
  const getCaseTriageLabel = (caseItem) => {
    if (!caseItem) return t.triageLevel(medicalData.severity);
    const title = caseItem.manualTriageOverride?.reason ? t.triageNurseAdjusted : caseItem.backend?.ctas?.title;
    return title ? `CTAS ${caseItem.triageScore} | ${title}` : `CTAS ${caseItem.triageScore}`;
  };
  const getStatusLabel = (status) => {
    if (status === "reviewing") return t.statusWaiting;
    if (status === "ready") return t.queueReady;
    const statusItem = statusLegendItems.find((item) => item.id === status);
    return statusItem ? t[statusItem.labelKey] : status;
  };
  const VoiceInputButton = () => (
    <button
      type="button"
      disabled
      title={t.voiceDisabled}
      className="inline-flex cursor-not-allowed items-center gap-2 rounded-2xl bg-cyan-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-cyan-300"
    >
      <Mic size={14} />
      {t.voiceIdle}
    </button>
  );
  const toggleQueueSection = (sectionId) => {
    setExpandedQueueSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const speakText = async (text) => {
    if (!text || isSpeaking || !apiKey) return;

    setIsSpeaking(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: "Kore"
                  }
                }
              }
            }
          })
        }
      );

      const result = await response.json();
      const audioData = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audioData) throw new Error("No audio data returned from TTS.");

      const audioBlob = pcmToWav(audioData, 24000);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setIsSpeaking(false);
      };
      await audio.play();
    } catch (error) {
      console.error("Speech error", error);
      setIsSpeaking(false);
    }
  };

  const pcmToWav = (base64, sampleRate) => {
    const buffer = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)).buffer;
    const wav = new Uint8Array(44 + buffer.byteLength);
    const viewData = new DataView(wav.buffer);

    viewData.setUint32(0, 0x52494646, false);
    viewData.setUint32(4, 36 + buffer.byteLength, true);
    viewData.setUint32(8, 0x57415645, false);
    viewData.setUint32(12, 0x666d7420, false);
    viewData.setUint16(16, 16, true);
    viewData.setUint16(20, 1, true);
    viewData.setUint16(22, 1, true);
    viewData.setUint32(24, sampleRate, true);
    viewData.setUint32(28, sampleRate * 2, true);
    viewData.setUint16(32, 2, true);
    viewData.setUint16(34, 16, true);
    viewData.setUint32(36, 0x64617461, false);
    viewData.setUint32(40, buffer.byteLength, true);
    wav.set(new Uint8Array(buffer), 44);

    return new Blob([wav], { type: "audio/wav" });
  };

  const toggleSelection = (key, value) => {
    setMedicalData((prev) => {
      const list = prev[key];
      if (NONE_VALUES.includes(value)) {
        return { ...prev, [key]: [value] };
      }

      const nextList = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list.filter((item) => !NONE_VALUES.includes(item)), value];

      return { ...prev, [key]: nextList };
    });
  };

  const toggleLocationSelection = (value) => {
    setMedicalData((prev) => {
      const list = prev.painLocation;
      const nextList = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      return { ...prev, painLocation: nextList, followUpAnswer: "", followUpOther: "" };
    });
  };

  const getDisplayList = (items, otherValue) => {
    const baseItems = items.filter((item) => item !== "Other");
    return otherValue.trim() ? [...baseItems, otherValue.trim()] : baseItems;
  };

  const updateData = (key, value) => {
    setVoiceDisplayValues((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setMedicalData((prev) => ({ ...prev, [key]: value }));
  };

  const updateVoiceData = (key, originalText, englishText) => {
    const cleanOriginal = String(originalText || "").trim();
    const cleanEnglish = String(englishText || "").trim();
    if (!cleanEnglish) return;

    setMedicalData((prev) => ({ ...prev, [key]: cleanEnglish }));
    setVoiceDisplayValues((prev) => ({
      ...prev,
      [key]: cleanOriginal && cleanOriginal !== cleanEnglish ? `${cleanOriginal}\n${cleanEnglish}` : cleanEnglish
    }));
  };

  const maskIdNumber = (value) => {
    if (!value) return t.unspecified;
    const trimmed = value.trim();
    if (trimmed.length <= 4) return trimmed;
    return `**** ${trimmed.slice(-4)}`;
  };

  const formatTime = (value) => new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const getPainDescriptor = (severity) => t.painDescriptors?.[severity] || `${severity}/10`;

  const getHistoricalMatches = (caseItem) =>
    caseItem?.backend?.ragEvidence?.matches?.length
      ? caseItem.backend.ragEvidence.matches
      : caseItem
        ? getHistoricalMatchesForPatient(caseItem.patient, caseItem.triageScore)
        : [];

  const hasHistoricalSupport = (caseItem) =>
    typeof caseItem?.backend?.ragEvidence?.historicalSupport === "boolean"
      ? caseItem.backend.ragEvidence.historicalSupport
      : caseItem
        ? hasHistoricalSupportForPatient(caseItem.patient, caseItem.triageScore)
        : false;

  const buildSubmissionPayload = () => {
    const historyDisplay = getDisplayList(medicalData.history, medicalData.historyOther);
    const allergyDisplay = getDisplayList(medicalData.allergies, medicalData.allergiesOther);
    const onsetDisplay = medicalData.onset === t.other ? medicalData.onsetOther.trim() : medicalData.onset;
    const painTypeDisplay = medicalData.painType === t.other ? medicalData.painTypeOther.trim() : medicalData.painType;
    const followUpDisplay =
      medicalData.followUpAnswer === t.other ? medicalData.followUpOther.trim() : medicalData.followUpAnswer;
    const updateOtherDisplay = medicalData.updateOther.trim();
    const additionalInfoDisplay = medicalData.additionalInfo.trim();

    return {
      ...medicalData,
      preferredLanguage: lang || "en",
      historyDisplay,
      allergyDisplay,
      onsetDisplay,
      painTypeDisplay,
      followUpDisplay,
      updateOtherDisplay,
      additionalInfoDisplay
    };
  };

  const syncCaseRecord = (backendResult = null) => {
    const now = new Date().toISOString();
    const nextCaseId = activeCaseId || `CB-${Date.now().toString().slice(-6)}`;
    const existingCase = cases.find((item) => item.id === nextCaseId);
    const existingStatus = existingCase?.nurseStatus || "waiting";
    const submissionPayload = buildSubmissionPayload();
    const lockedOverride = existingCase?.manualTriageOverride?.reason ? existingCase.manualTriageOverride : null;
    const answeredNurseRequest =
      existingCase?.nurseFollowUpRequest?.status === "open"
        ? {
            ...existingCase.nurseFollowUpRequest,
            status: "answered",
            answeredAt: now,
            answer: submissionPayload.updateOtherDisplay || submissionPayload.followUpDisplay || "Clinical update submitted."
          }
        : existingCase?.nurseFollowUpRequest || null;

    const payload = {
      id: nextCaseId,
      patient: submissionPayload,
      language: lang || "en",
      triageScore: lockedOverride ? existingCase.triageScore : backendResult?.ctas?.level ?? getTriageScore(medicalData.severity),
      backend: lockedOverride ? existingCase.backend : backendResult,
      manualTriageOverride: lockedOverride,
      nurseFollowUpRequest: answeredNurseRequest,
      nurseStatus: existingCase?.nurseFollowUpRequest?.status === "open" ? "needs-info" : existingStatus,
      updatedAt: now
    };

    setCases((prev) => {
      const exists = prev.some((item) => item.id === nextCaseId);
      if (exists) {
        return prev.map((item) => (item.id === nextCaseId ? payload : item));
      }
      return [payload, ...prev];
    });

    setActiveCaseId(nextCaseId);
  };

  const submitTriage = async () => {
    setIsSubmittingTriage(true);
    setTriageError("");
    try {
      const response = await fetch(TRIAGE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSubmissionPayload())
      });

      if (!response.ok) {
        throw new Error(`Backend triage request failed with ${response.status}`);
      }

      const backendResult = await response.json();
      syncCaseRecord(backendResult);
      setStep("summary");
    } catch (error) {
      console.error(error);
      setTriageError("Backend triage is unavailable right now. Please verify the local Python service is running.");
      syncCaseRecord(null);
      setStep("summary");
    } finally {
      setIsSubmittingTriage(false);
    }
  };

  const resetSession = () => {
    setLang(null);
    setStep("language");
    setView("patient");
    setActiveCaseId(null);
    setMedicalData(EMPTY_MEDICAL_DATA);
  };

  const handleLanguageSelect = (languageId) => {
    setLang(languageId);
    setStep("login");
  };

  const updateCaseStatus = (caseId, status) => {
    if (!caseId) return;
    setCases((prev) =>
      prev.map((item) =>
        item.id === caseId ? { ...item, nurseStatus: status, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const updateTriageOverrideDraft = (caseId, value) => {
    setTriageOverrideDrafts((prev) => ({
      ...prev,
      [caseId]: value
    }));
  };

  const updateNurseQuestionDraft = (caseId, value) => {
    setNurseQuestionDrafts((prev) => ({
      ...prev,
      [caseId]: value
    }));
  };

  const requestMorePatientInfo = (caseItem) => {
    const question = nurseQuestionDrafts[caseItem.id]?.trim();
    if (!question) return;

    setCases((prev) =>
      prev.map((item) =>
        item.id === caseItem.id
          ? {
              ...item,
              nurseStatus: "needs-info",
              nurseFollowUpRequest: {
                question,
                status: "open",
                requestedAt: new Date().toISOString()
              },
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );

    setNurseQuestionDrafts((prev) => ({
      ...prev,
      [caseItem.id]: ""
    }));
  };

  const applyTriageOverride = (caseId, direction) => {
    const draftReason = triageOverrideDrafts[caseId]?.trim();
    if (!caseId || !draftReason) return;

    setCases((prev) =>
      prev.map((item) => {
        if (item.id !== caseId) return item;
        const delta = direction === "upgrade" ? -1 : 1;
        const nextScore = Math.min(5, Math.max(1, item.triageScore + delta));
        if (nextScore === item.triageScore) return item;

        return {
          ...item,
          triageScore: nextScore,
          manualTriageOverride: {
            direction,
            reason: draftReason,
            previousLevel: item.triageScore,
            appliedAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        };
      })
    );

    setTriageOverrideDrafts((prev) => ({
      ...prev,
      [caseId]: ""
    }));
  };

  const loadDemoCases = () => {
    const demoCases = makeNurseDemoCases();
    setCases((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));
      const nextCases = demoCases.filter((item) => !existingIds.has(item.id));
      return [...prev, ...nextCases];
    });
    setView("nurse");
  };

  const canContinueToSummary = Boolean(
    medicalData.painLocation.length > 0 &&
      medicalData.onset &&
      medicalData.painType &&
      (medicalData.followUpAnswer === t.other ? medicalData.followUpOther.trim() : medicalData.followUpAnswer)
  );
  const canVerifyPatient = Boolean(
    medicalData.name.trim() &&
      medicalData.birthDate
  );
  const canSaveClinicalUpdate = Boolean(
    medicalData.painLocation.length > 0 &&
      medicalData.lostConsciousness &&
      medicalData.breathingDifficulty &&
      medicalData.severity >= 0
  );
  const speakerLabel =
    step === "profile" ? t.history : step === "symptoms" || step === "followup" ? t.symptomCheck : t.title;
  const showBackNav = !["language", "login", "summary", "edit"].includes(step);

  const renderNurseCaseCard = (item) => {
    const historicalMatches = getHistoricalMatches(item);
    const historicalSupport = hasHistoricalSupport(item);
    const ctasTitle = item.manualTriageOverride?.reason ? t.triageNurseAdjusted : item.backend?.ctas?.title;
    const ctasDisplay = ctasTitle
      ? `CTAS ${item.triageScore}${historicalSupport ? "*" : ""} | ${ctasTitle}`
      : `CTAS ${item.triageScore}${historicalSupport ? "*" : ""}`;
    const isActive = activeCaseId === item.id;

    return (
      <div
        key={item.id}
        className={`overflow-hidden rounded-3xl border transition ${
          isActive ? "border-red-300 bg-red-50" : "border-slate-100 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-3 p-4">
          <div>
            <button
              type="button"
              onClick={() => setActiveCaseId((current) => (current === item.id ? null : item.id))}
              className="text-left text-base font-black text-slate-900"
            >
              {item.patient.name || t.unspecified}
            </button>
            <div className="mt-1 text-xs font-semibold text-slate-500">
              {item.id} | {item.patient.painLocation.join(", ") || t.unspecified} | CTAS {item.triageScore}
              {historicalSupport ? "*" : ""}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {hasPatientUpdate(item) && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
                {t.patientUpdated}
              </span>
            )}
            {historicalSupport && (
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-700">
                CTAS*
              </span>
            )}
          </div>
        </div>

        {isActive && (
          <div className="border-t border-red-100 bg-white p-5">
            <div className="text-sm text-slate-500">
              {item.id} | {t.lastUpdated} {formatTime(item.updatedAt)}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.triageScore}</div>
                <div className="mt-1 text-lg font-bold text-red-600">{ctasDisplay}</div>
                {item.manualTriageOverride?.reason && (
                  <div className="mt-2 inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-700">
                    {t.triageLocked}
                  </div>
                )}
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.intakeMethod}</div>
                <div className="mt-1 text-sm font-bold text-slate-900">{t.idNumberLabel}</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.location}</div>
                <div className="mt-1 text-sm font-bold text-slate-900">{item.patient.painLocation.join(", ") || t.unspecified}</div>
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.painIndex}</div>
                <div className="mt-1 text-sm font-bold text-slate-900">{item.patient.severity}/10</div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-cyan-200 bg-cyan-50 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-800">
                <Database size={15} />
                RAG evidence
              </div>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
                CTAS* = the rule-based level is supported by {historicalMatches.length || "no"} similar labeled historical case{historicalMatches.length === 1 ? "" : "s"}.
              </p>
              {historicalMatches.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {historicalMatches.slice(0, 2).map((historical) => (
                    <div key={historical.id} className="rounded-2xl bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-black text-slate-900">{historical.id} | {historical.complaint}</span>
                        <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-black text-white">CTAS {historical.ctas}</span>
                      </div>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{historical.summary}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs font-semibold text-slate-500">{t.ragNoMatches}</p>
              )}
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-700">
              {item.backend?.ctas?.modifiersApplied?.length > 0 && (
                <div>Reasoning: {item.backend.ctas.modifiersApplied.join(" | ")}</div>
              )}
              {item.manualTriageOverride?.reason && (
                <div>
                  {t.triageOverrideReason}: CTAS {item.manualTriageOverride.previousLevel} to CTAS {item.triageScore} | {item.manualTriageOverride.reason}
                </div>
              )}
              <div>{item.patient.painTypeDisplay || t.unspecified} | {item.patient.onsetDisplay || t.unspecified}</div>
              <div>{t.updateLostConsciousness}: {item.patient.lostConsciousness || t.unspecified}</div>
              <div>{t.updateBreathing}: {item.patient.breathingDifficulty || t.unspecified}</div>
              <div>{t.updateOtherLabel}: {item.patient.updateOtherDisplay || t.noneReported}</div>
              <div>{t.additionalInfoLabel}: {item.patient.additionalInfoDisplay || item.patient.additionalInfo || t.noneReported}</div>
              <div>{t.followUpSummary}: {item.patient.followUpDisplay || t.unspecified}</div>
              <div>{t.history}: {item.patient.historyDisplay.length > 0 ? item.patient.historyDisplay.join(", ") : t.noneReported}</div>
              <div>{t.allergies}: {item.patient.allergyDisplay.length > 0 ? item.patient.allergyDisplay.join(", ") : t.noneReported}</div>
            </div>

            <div className="mt-5 rounded-3xl border border-cyan-100 bg-white p-4 shadow-sm">
              <div className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{t.nurseFollowUpTitle}</div>
              <p className="mt-2 text-sm text-slate-600">{t.nurseFollowUpHelp}</p>
              {item.nurseFollowUpRequest && (
                <div className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-cyan-800">
                    {item.nurseFollowUpRequest.status === "answered" ? t.nurseQuestionAnswered : t.nurseQuestionPending}
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-800">{item.nurseFollowUpRequest.question}</p>
                  {item.nurseFollowUpRequest.answer && (
                    <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">Answer: {item.nurseFollowUpRequest.answer}</p>
                  )}
                </div>
              )}
              <textarea
                value={nurseQuestionDrafts[item.id] || ""}
                onChange={(event) => updateNurseQuestionDraft(item.id, event.target.value)}
                placeholder={t.nurseFollowUpPlaceholder}
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
              />
              <div className="mt-3 flex gap-2">
                <VoiceInputButton
                  fieldId={`nurse-question-${item.id}`}
                  onVoiceResult={({ englishText }) => updateNurseQuestionDraft(item.id, englishText)}
                />
                <button
                  type="button"
                  disabled={!nurseQuestionDrafts[item.id]?.trim()}
                  onClick={() => requestMorePatientInfo(item)}
                  className={`flex-1 rounded-2xl px-3 py-3 text-xs font-black uppercase ${
                    nurseQuestionDrafts[item.id]?.trim() ? "bg-cyan-600 text-white" : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {t.nurseFollowUpSend}
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.triageOverrideTitle}</div>
              <p className="mt-2 text-sm text-slate-600">{t.triageOverrideHelp}</p>
              <textarea
                value={triageOverrideDrafts[item.id] || ""}
                onChange={(event) => updateTriageOverrideDraft(item.id, event.target.value)}
                placeholder={t.triageOverridePlaceholder}
                disabled={Boolean(item.manualTriageOverride?.reason)}
                className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                  item.manualTriageOverride?.reason
                    ? "border-slate-200 bg-slate-100 text-slate-400"
                    : "border-slate-200 bg-white text-slate-900 focus:border-red-400"
                  }`}
              />
              <div className="mt-3">
                <VoiceInputButton
                  fieldId={`triage-override-${item.id}`}
                  onVoiceResult={({ englishText }) => updateTriageOverrideDraft(item.id, englishText)}
                />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={Boolean(item.manualTriageOverride?.reason) || !triageOverrideDrafts[item.id]?.trim() || item.triageScore <= 1}
                  onClick={() => applyTriageOverride(item.id, "upgrade")}
                  className={`rounded-2xl px-3 py-3 text-xs font-black uppercase ${
                    item.manualTriageOverride?.reason || !triageOverrideDrafts[item.id]?.trim() || item.triageScore <= 1
                      ? "bg-slate-200 text-slate-400"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {t.triageUpgrade}
                </button>
                <button
                  type="button"
                  disabled={Boolean(item.manualTriageOverride?.reason) || !triageOverrideDrafts[item.id]?.trim() || item.triageScore >= 5}
                  onClick={() => applyTriageOverride(item.id, "downgrade")}
                  className={`rounded-2xl px-3 py-3 text-xs font-black uppercase ${
                    item.manualTriageOverride?.reason || !triageOverrideDrafts[item.id]?.trim() || item.triageScore >= 5
                      ? "bg-slate-200 text-slate-400"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  {t.triageDowngrade}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderIntakeForm = (mode) => (
    <div className="space-y-6">
      <div className="mb-8 text-center">
        <ShieldAlert size={48} className="mx-auto mb-4 text-red-600" />
        <h2 className="text-2xl font-bold">{mode === "edit" ? t.editTitle : t.loginTitle}</h2>
        <p className="text-slate-500">{mode === "edit" ? t.editHelp : t.loginHelp}</p>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.fullName}</label>
          <input
            type="text"
            value={medicalData.name}
            onChange={(event) => updateData("name", event.target.value)}
            placeholder={t.fullNamePlaceholder}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.birthDateLabel}</label>
          <input
            type="date"
            value={medicalData.birthDate}
            onChange={(event) => updateData("birthDate", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.idCheckLabel}</label>
          <input
            type="text"
            value={medicalData.idNumber}
            onChange={(event) => updateData("idNumber", event.target.value)}
            placeholder={t.idNumberPlaceholder}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
          />
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{t.idScanHelp}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold uppercase tracking-widest text-emerald-700">
        {medicalData.idNumber.trim() ? `${t.idNumberLabel}: ${maskIdNumber(medicalData.idNumber)}` : t.idScanHelp}
      </div>

      <button
        type="button"
        disabled={!canVerifyPatient}
        onClick={() => {
          if (mode === "edit") {
            setStep("profile");
          } else {
            setStep("profile");
          }
        }}
        className={`flex w-full items-center justify-center gap-3 rounded-3xl py-5 font-black shadow-xl transition-all ${
          canVerifyPatient ? "bg-red-600 text-white shadow-red-100" : "bg-slate-200 text-slate-400"
        }`}
      >
        {mode === "edit" ? t.save : t.verify} <ChevronRight size={20} />
      </button>

    </div>
  );

  return (
    <div className="min-h-screen bg-transparent px-4 py-6 text-slate-900">
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col overflow-hidden rounded-[28px] border border-white/60 bg-white/90 shadow-panel backdrop-blur">
        <div className="flex shrink-0 items-center justify-between bg-red-600 p-6 pt-12 text-white">
          <div className="flex items-center gap-3">
            <ShieldAlert size={28} />
            <h1 className="text-xl font-black uppercase italic tracking-tight">{view === "nurse" ? t.nurseDashboard : t.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {lang && view === "patient" && (
              null
            )}
            {view === "nurse" && (
              <button
                type="button"
                onClick={() => setView("patient")}
                className="rounded-full bg-red-500 p-3 text-white shadow-lg"
                title={t.patientView}
              >
                <ArrowLeftRight size={20} />
              </button>
            )}
            {view === "patient" && (
              <button
                type="button"
                onClick={() => setView("nurse")}
                className="rounded-2xl bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-red-600 shadow-lg"
              >
                Nurse
              </button>
            )}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {view === "nurse" ? (
            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-100 bg-white p-5">
                <h2 className="text-lg font-black text-slate-900">{t.nurseQueue}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {cases.length > 0 ? t.queueCount(cases.length) : t.nurseEmpty}
                </p>
                <p className="mt-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-700">
                  {t.nurseQueueSort}
                </p>
                <button
                  type="button"
                  onClick={loadDemoCases}
                  className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white"
                >
                  {t.loadDemoCases}
                </button>
              </div>

              {sortedCases.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                  {t.nurseEmpty}
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {queueSections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setSelectedQueueSectionId(section.id)}
                        className="flex w-full items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-sm transition hover:border-red-100 hover:bg-red-50"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${section.tone}`}>
                              {t[section.titleKey]}
                            </span>
                            <span className="text-lg font-black text-slate-400">{section.cases.length}</span>
                          </div>
                          <p className="mt-3 text-sm font-bold leading-6 text-slate-500">{t[section.helpKey]}</p>
                        </div>
                        <ChevronRight size={22} className="shrink-0 text-slate-400" />
                      </button>
                    ))}
                  </div>

                  <div className="hidden">
                  {queueSections.map((section) => (
                    <section key={section.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white">
                      <button
                        type="button"
                        onClick={() => toggleQueueSection(section.id)}
                        className="flex w-full items-center justify-between gap-3 p-4 text-left"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${section.tone}`}>
                              {t[section.titleKey]}
                            </span>
                            <span className="text-xs font-black text-slate-400">{section.cases.length}</span>
                          </div>
                          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">{t[section.helpKey]}</p>
                        </div>
                        <ChevronRight
                          size={20}
                          className={`shrink-0 text-slate-400 transition ${expandedQueueSections[section.id] ? "rotate-90" : ""}`}
                        />
                      </button>

                      {expandedQueueSections[section.id] && (
                        <div className="space-y-3 border-t border-slate-100 bg-slate-50 p-3">
                          {section.cases.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm font-semibold text-slate-400">
                              No cases in this group.
                            </div>
                          ) : (
                            section.cases.map((item) => {
                  const historicalMatches = getHistoricalMatches(item);
                  const historicalSupport = hasHistoricalSupport(item);
                  const ctasTitle = item.manualTriageOverride?.reason ? t.triageNurseAdjusted : item.backend?.ctas?.title;
                  const ctasDisplay = ctasTitle
                    ? `CTAS ${item.triageScore}${historicalSupport ? "*" : ""} | ${ctasTitle}`
                    : `CTAS ${item.triageScore}${historicalSupport ? "*" : ""}`;

                  return (
                  <div
                    key={item.id}
                    className={`overflow-hidden rounded-3xl border transition ${
                      activeCaseId === item.id ? "border-red-300 bg-red-50" : "border-slate-100 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 p-5">
                      <div>
                        <button
                          type="button"
                          onClick={() => setActiveCaseId((current) => (current === item.id ? null : item.id))}
                          className="text-left text-lg font-black text-slate-900"
                        >
                          {item.patient.name || t.unspecified}
                        </button>
                        <div className="mt-1 text-sm text-slate-500">
                          {item.id} | {item.patient.painLocation.join(", ") || t.unspecified} | CTAS {item.triageScore}{historicalSupport ? "*" : ""}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {hasPatientUpdate(item) && (
                          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-700">
                            {t.patientUpdated}
                          </span>
                        )}
                        {historicalSupport && (
                          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-700">
                            CTAS*
                          </span>
                        )}
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${statusTone[item.nurseStatus]}`}>
                          {getStatusLabel(item.nurseStatus)}
                        </span>
                      </div>
                    </div>

                    {activeCaseId === item.id && (
                      <div className="border-t border-red-100 bg-white p-5">
                        <div className="text-sm text-slate-500">
                          {item.id} | {t.lastUpdated} {formatTime(item.updatedAt)}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.triageScore}</div>
                            <div className="mt-1 text-lg font-bold text-red-600">
                              {ctasDisplay}
                            </div>
                            {item.manualTriageOverride?.reason && (
                              <div className="mt-2 inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-red-700">
                                {t.triageLocked}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.intakeMethod}</div>
                            <div className="mt-1 text-sm font-bold text-slate-900">{t.idNumberLabel}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.location}</div>
                            <div className="mt-1 text-sm font-bold text-slate-900">{item.patient.painLocation.join(", ") || t.unspecified}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.painIndex}</div>
                            <div className="mt-1 text-sm font-bold text-slate-900">{item.patient.severity}/10</div>
                          </div>
                        </div>

                        <div className="mt-5 rounded-3xl border border-cyan-200 bg-cyan-50 p-4 shadow-sm">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-cyan-800">
                            <Database size={15} />
                            RAG evidence
                          </div>
                          <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
                            CTAS* = the rule-based level is supported by {historicalMatches.length || "no"} similar labeled historical case{historicalMatches.length === 1 ? "" : "s"}.
                          </p>
                          {historicalMatches.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              {historicalMatches.slice(0, 2).map((historical) => (
                                <div key={historical.id} className="rounded-2xl bg-white p-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-black text-slate-900">{historical.id} | {historical.complaint}</span>
                                    <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-black text-white">CTAS {historical.ctas}</span>
                                  </div>
                                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{historical.summary}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs font-semibold text-slate-500">{t.ragNoMatches}</p>
                          )}
                        </div>

                        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm text-slate-700">
                          {item.backend?.ctas?.modifiersApplied?.length > 0 && (
                            <div>Reasoning: {item.backend.ctas.modifiersApplied.join(" | ")}</div>
                          )}
                          {item.manualTriageOverride?.reason && (
                            <div>
                              {t.triageOverrideReason}: CTAS {item.manualTriageOverride.previousLevel} to CTAS {item.triageScore} | {item.manualTriageOverride.reason}
                            </div>
                          )}
                          <div>{item.patient.painTypeDisplay || t.unspecified} | {item.patient.onsetDisplay || t.unspecified}</div>
                          <div>{t.updateLostConsciousness}: {item.patient.lostConsciousness || t.unspecified}</div>
                          <div>{t.updateBreathing}: {item.patient.breathingDifficulty || t.unspecified}</div>
                          <div>{t.updateOtherLabel}: {item.patient.updateOtherDisplay || t.noneReported}</div>
                          <div>{t.additionalInfoLabel}: {item.patient.additionalInfoDisplay || item.patient.additionalInfo || t.noneReported}</div>
                          <div>{t.followUpSummary}: {item.patient.followUpDisplay || t.unspecified}</div>
                          <div>{t.history}: {item.patient.historyDisplay.length > 0 ? item.patient.historyDisplay.join(", ") : t.noneReported}</div>
                          <div>{t.allergies}: {item.patient.allergyDisplay.length > 0 ? item.patient.allergyDisplay.join(", ") : t.noneReported}</div>
                        </div>

                        <div className="mt-5 rounded-3xl border border-cyan-100 bg-white p-4 shadow-sm">
                          <div className="text-[10px] font-black uppercase tracking-widest text-cyan-700">{t.nurseFollowUpTitle}</div>
                          <p className="mt-2 text-sm text-slate-600">{t.nurseFollowUpHelp}</p>
                          {item.nurseFollowUpRequest && (
                            <div className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-3">
                              <div className="text-[10px] font-black uppercase tracking-widest text-cyan-800">
                                {item.nurseFollowUpRequest.status === "answered" ? t.nurseQuestionAnswered : t.nurseQuestionPending}
                              </div>
                              <p className="mt-1 text-sm font-bold text-slate-800">{item.nurseFollowUpRequest.question}</p>
                              {item.nurseFollowUpRequest.answer && (
                                <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
                                  Answer: {item.nurseFollowUpRequest.answer}
                                </p>
                              )}
                            </div>
                          )}
                          <textarea
                            value={nurseQuestionDrafts[item.id] || ""}
                            onChange={(event) => updateNurseQuestionDraft(item.id, event.target.value)}
                            placeholder={t.nurseFollowUpPlaceholder}
                            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white"
                          />
                          <div className="mt-3">
                            <button
                              type="button"
                              disabled={!nurseQuestionDrafts[item.id]?.trim()}
                              onClick={() => requestMorePatientInfo(item)}
                              className={`w-full rounded-2xl px-3 py-3 text-xs font-black uppercase ${
                                nurseQuestionDrafts[item.id]?.trim()
                                  ? "bg-cyan-600 text-white"
                                  : "bg-slate-200 text-slate-400"
                              }`}
                            >
                              {t.nurseFollowUpSend}
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.triageOverrideTitle}</div>
                          <p className="mt-2 text-sm text-slate-600">{t.triageOverrideHelp}</p>
                          <textarea
                            value={triageOverrideDrafts[item.id] || ""}
                            onChange={(event) => updateTriageOverrideDraft(item.id, event.target.value)}
                            placeholder={t.triageOverridePlaceholder}
                            disabled={Boolean(item.manualTriageOverride?.reason)}
                            className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                              item.manualTriageOverride?.reason
                                ? "border-slate-200 bg-slate-100 text-slate-400"
                                : "border-slate-200 bg-white text-slate-900 focus:border-red-400"
                            }`}
                          />
                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              disabled={Boolean(item.manualTriageOverride?.reason) || !triageOverrideDrafts[item.id]?.trim() || item.triageScore <= 1}
                              onClick={() => applyTriageOverride(item.id, "upgrade")}
                              className={`rounded-2xl px-3 py-3 text-xs font-black uppercase ${
                                item.manualTriageOverride?.reason || !triageOverrideDrafts[item.id]?.trim() || item.triageScore <= 1
                                  ? "bg-slate-200 text-slate-400"
                                  : "bg-red-600 text-white"
                              }`}
                            >
                              {t.triageUpgrade}
                            </button>
                            <button
                              type="button"
                              disabled={Boolean(item.manualTriageOverride?.reason) || !triageOverrideDrafts[item.id]?.trim() || item.triageScore >= 5}
                              onClick={() => applyTriageOverride(item.id, "downgrade")}
                              className={`rounded-2xl px-3 py-3 text-xs font-black uppercase ${
                                item.manualTriageOverride?.reason || !triageOverrideDrafts[item.id]?.trim() || item.triageScore >= 5
                                  ? "bg-slate-200 text-slate-400"
                                  : "bg-slate-900 text-white"
                              }`}
                            >
                              {t.triageDowngrade}
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
                            })
                          )}
                        </div>
                      )}
                    </section>
                  ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {step === "language" && (
                <div className="space-y-6">
                  <div className="mb-8 text-center">
                    <Languages size={48} className="mx-auto mb-4 text-red-600" />
                    <h2 className="text-2xl font-bold">{t.selectLanguage}</h2>
                    <p className="text-slate-500">{t.selectLanguageHelp}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {languageOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleLanguageSelect(option.id)}
                        className="group flex items-center justify-between rounded-2xl border-2 border-slate-100 p-5 text-left transition-all hover:border-red-500 hover:bg-red-50"
                      >
                        <div>
                          <div className="text-lg font-bold">{option.label}</div>
                          <div className="text-xs font-bold uppercase text-slate-400">{option.sub}</div>
                        </div>
                        <ChevronRight className="text-slate-300 group-hover:text-red-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === "login" && renderIntakeForm("login")}

              {step === "edit" && (
                <div className="space-y-8">
                  <div className="mb-4 text-center">
                    <Activity size={48} className="mx-auto mb-4 text-red-600" />
                    <h2 className="text-2xl font-bold">{t.editTitle}</h2>
                    <p className="text-slate-500">{t.editHelp}</p>
                  </div>

                  {activeNurseRequest && (
                    <section className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-cyan-800">{t.nurseQuestion}</div>
                      <p className="mt-2 text-lg font-black leading-7 text-slate-900">{activeNurseRequest.question}</p>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        Please update the symptom details below. The CTAS modifiers will re-run after you save.
                      </p>
                    </section>
                  )}

                  <section>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.updateLocationLabel}</label>
                    <div className="flex flex-wrap gap-2">
                      {t.locations.map((location) => (
                        <button
                          key={location}
                          type="button"
                          onClick={() => toggleLocationSelection(location)}
                          className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all ${
                            medicalData.painLocation.includes(location)
                              ? "border-red-600 bg-red-600 text-white"
                              : "border-slate-100 bg-white text-slate-600"
                          }`}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.severityLabel}</label>
                    <div className="mb-2 flex items-end justify-between">
                      <div>
                        <span className="text-5xl font-black text-red-600">{medicalData.severity}</span>
                        <p className="mt-1 text-sm font-bold text-slate-500">{getPainDescriptor(medicalData.severity)}</p>
                      </div>
                      <span className="mb-2 text-xs font-bold text-slate-400">{t.scale}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={medicalData.severity}
                      onChange={(event) => updateData("severity", parseInt(event.target.value, 10))}
                      className="h-4 w-full cursor-pointer appearance-none rounded-full bg-slate-100"
                    />
                  </section>

                  <section className="rounded-3xl border border-slate-100 bg-white p-6">
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t.updateLostConsciousness}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[t.yes, t.no].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateData("lostConsciousness", option)}
                          className={`rounded-2xl border-2 p-4 text-center font-bold transition-all ${
                            medicalData.lostConsciousness === option
                              ? "border-red-600 bg-red-50 text-red-700"
                              : "border-slate-100"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-100 bg-white p-6">
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t.updateBreathing}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[t.yes, t.no].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateData("breathingDifficulty", option)}
                          className={`rounded-2xl border-2 p-4 text-center font-bold transition-all ${
                            medicalData.breathingDifficulty === option
                              ? "border-red-600 bg-red-50 text-red-700"
                              : "border-slate-100"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-slate-100 bg-white p-6">
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t.updateOtherLabel}
                    </label>
                    <textarea
                      value={voiceDisplayValues.updateOther || medicalData.updateOther}
                      onChange={(event) => updateData("updateOther", event.target.value)}
                      placeholder={t.otherPlaceholder}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
                    />
                    <div className="mt-2">
                      <VoiceInputButton
                        fieldId="update-other"
                        onVoiceResult={({ originalText, englishText }) => updateVoiceData("updateOther", originalText, englishText)}
                      />
                    </div>
                  </section>

                  <button
                    type="button"
                    disabled={!canSaveClinicalUpdate || isSubmittingTriage}
                    onClick={submitTriage}
                    className={`flex w-full items-center justify-center gap-3 rounded-3xl py-5 font-black shadow-xl transition-all ${
                      canSaveClinicalUpdate && !isSubmittingTriage ? "bg-red-600 text-white" : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isSubmittingTriage ? t.triageSubmitting : t.save} <CheckCircle2 size={20} />
                  </button>
                </div>
              )}

              {step === "profile" && (
                <div className="space-y-6">
                  <div className="mb-6 rounded-3xl bg-slate-900 p-6 text-white">
                    <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">{t.history}</h2>
                    <div className="flex flex-wrap gap-2">
                      {t.historyPrompts.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleSelection("history", item)}
                          className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                            medicalData.history.includes(item) ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    {medicalData.history.includes(t.other) && (
                      <div>
                      <textarea
                        value={voiceDisplayValues.historyOther || medicalData.historyOther}
                        onChange={(event) => updateData("historyOther", event.target.value)}
                        placeholder={t.otherPlaceholder}
                        className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition focus:border-red-400"
                      />
                      <div className="mt-2">
                        <VoiceInputButton
                          fieldId="history-other"
                          onVoiceResult={({ originalText, englishText }) => updateVoiceData("historyOther", originalText, englishText)}
                        />
                      </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border-2 border-slate-100 bg-white p-6">
                    <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">{t.allergies}</h2>
                    <div className="flex flex-wrap gap-2">
                      {t.allergyPrompts.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleSelection("allergies", item)}
                          className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all ${
                            medicalData.allergies.includes(item)
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-100 text-slate-500"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    {medicalData.allergies.includes(t.other) && (
                      <div>
                      <textarea
                        value={voiceDisplayValues.allergiesOther || medicalData.allergiesOther}
                        onChange={(event) => updateData("allergiesOther", event.target.value)}
                        placeholder={t.otherPlaceholder}
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
                      />
                      <div className="mt-2">
                        <VoiceInputButton
                          fieldId="allergies-other"
                          onVoiceResult={({ originalText, englishText }) => updateVoiceData("allergiesOther", originalText, englishText)}
                        />
                      </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep("symptoms")}
                    className="flex w-full items-center justify-center gap-3 rounded-3xl bg-red-600 py-5 font-black text-white shadow-xl shadow-red-100"
                  >
                    {t.next} <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {step === "symptoms" && (
                <div className="space-y-8 pb-20">
                  <section>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.locationLabel}</label>
                    <div className="flex flex-wrap gap-2">
                      {t.locations.map((location) => (
                        <button
                          key={location}
                          type="button"
                          onClick={() => toggleLocationSelection(location)}
                          className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all ${
                            medicalData.painLocation.includes(location)
                              ? "border-red-600 bg-red-600 text-white"
                              : "border-slate-100 bg-white text-slate-600"
                          }`}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.severityLabel}</label>
                    <div className="mb-2 flex items-end justify-between">
                      <div>
                        <span className="text-5xl font-black text-red-600">{medicalData.severity}</span>
                        <p className="mt-1 text-sm font-bold text-slate-500">{getPainDescriptor(medicalData.severity)}</p>
                      </div>
                      <span className="mb-2 text-xs font-bold text-slate-400">{t.scale}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={medicalData.severity}
                      onChange={(event) => updateData("severity", parseInt(event.target.value, 10))}
                      className="h-4 w-full cursor-pointer appearance-none rounded-full bg-slate-100"
                    />
                    <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>0 No pain</span>
                      <span>10 Worst</span>
                    </div>
                  </section>

                  <section>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.onsetLabel}</label>
                    <div className="grid grid-cols-1 gap-2">
                      {t.onsets.map((onset) => (
                        <button
                          key={onset}
                          type="button"
                          onClick={() => updateData("onset", onset)}
                          className={`rounded-2xl border-2 p-4 text-left font-bold transition-all ${
                            medicalData.onset === onset ? "border-red-600 bg-red-50 text-red-700" : "border-slate-100"
                          }`}
                        >
                          {onset}
                        </button>
                      ))}
                    </div>
                    {medicalData.onset === t.other && (
                      <div>
                      <textarea
                        value={voiceDisplayValues.onsetOther || medicalData.onsetOther}
                        onChange={(event) => updateData("onsetOther", event.target.value)}
                        placeholder={t.otherPlaceholder}
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
                      />
                      <div className="mt-2">
                        <VoiceInputButton
                          fieldId="onset-other"
                          onVoiceResult={({ originalText, englishText }) => updateVoiceData("onsetOther", originalText, englishText)}
                        />
                      </div>
                      </div>
                    )}
                  </section>

                  <section>
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">{t.sensationLabel}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {t.painTypes.map((painType) => (
                        <button
                          key={painType}
                          type="button"
                          onClick={() => updateData("painType", painType)}
                          className={`rounded-2xl border-2 p-4 text-center font-bold transition-all ${
                            medicalData.painType === painType
                              ? "border-red-600 bg-red-50 text-red-700"
                              : "border-slate-100"
                          }`}
                        >
                          {painType}
                        </button>
                      ))}
                    </div>
                    {medicalData.painType === t.other && (
                      <div>
                      <textarea
                        value={voiceDisplayValues.painTypeOther || medicalData.painTypeOther}
                        onChange={(event) => updateData("painTypeOther", event.target.value)}
                        placeholder={t.otherPlaceholder}
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
                      />
                      <div className="mt-2">
                        <VoiceInputButton
                          fieldId="pain-type-other"
                          onVoiceResult={({ originalText, englishText }) => updateVoiceData("painTypeOther", originalText, englishText)}
                        />
                      </div>
                      </div>
                    )}
                  </section>

                  <button
                    type="button"
                    disabled={medicalData.painLocation.length === 0 || !medicalData.onset || !medicalData.painType}
                    onClick={() => {
                      updateData("followUpAnswer", "");
                      setStep("followup");
                    }}
                    className={`flex w-full items-center justify-center gap-3 rounded-3xl py-5 font-black shadow-xl transition-all ${
                      medicalData.painLocation.length > 0 && medicalData.onset && medicalData.painType
                        ? "bg-red-600 text-white"
                        : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {t.next} <ChevronRight size={20} />
                  </button>
                </div>
              )}

              {step === "followup" && (
                <div className="space-y-6">
                  <section className="rounded-3xl border border-slate-100 bg-white p-6">
                    <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t.followUpTitle}
                    </label>
                    <h3 className="text-xl font-black text-slate-900">{followUpQuestion}</h3>
                    <p className="mt-2 text-sm text-slate-500">{t.followUpLabel}</p>
                  </section>

                  <section className="grid grid-cols-1 gap-3">
                    {followUpOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateData("followUpAnswer", option)}
                        className={`rounded-2xl border-2 p-4 text-left font-bold transition-all ${
                          medicalData.followUpAnswer === option
                            ? "border-red-600 bg-red-50 text-red-700"
                            : "border-slate-100 bg-white text-slate-700"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </section>

                  {medicalData.followUpAnswer === t.other && (
                    <div>
                      <textarea
                        value={voiceDisplayValues.followUpOther || medicalData.followUpOther}
                        onChange={(event) => updateData("followUpOther", event.target.value)}
                        placeholder={t.otherPlaceholder}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
                      />
                      <div className="mt-2">
                        <VoiceInputButton
                          fieldId="follow-up-other"
                          onVoiceResult={({ originalText, englishText }) => updateVoiceData("followUpOther", originalText, englishText)}
                        />
                      </div>
                    </div>
                  )}

                  <section className="rounded-3xl border border-slate-100 bg-white p-6">
                    <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t.additionalInfoLabel}
                    </label>
                    <p className="mb-3 text-sm font-semibold leading-6 text-slate-500">{t.additionalInfoHelp}</p>
                    <textarea
                      value={voiceDisplayValues.additionalInfo || medicalData.additionalInfo}
                      onChange={(event) => updateData("additionalInfo", event.target.value)}
                      placeholder={t.otherPlaceholder}
                      className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-400 focus:bg-white"
                    />
                    <div className="mt-2">
                      <VoiceInputButton
                        fieldId="additional-info"
                        onVoiceResult={({ originalText, englishText }) => updateVoiceData("additionalInfo", originalText, englishText)}
                      />
                    </div>
                  </section>

                  {isSubmittingTriage && (
                    <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm font-black text-cyan-800">
                      {t.triageSubmitting}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!canContinueToSummary || isSubmittingTriage}
                    onClick={submitTriage}
                    className={`flex w-full items-center justify-center gap-3 rounded-3xl py-5 font-black shadow-xl transition-all ${
                      canContinueToSummary && !isSubmittingTriage ? "bg-red-600 text-white" : "bg-slate-200 text-slate-400"
                    }`}
                  >
                    {isSubmittingTriage ? t.triageSubmitting : t.finish} <CheckCircle2 size={20} />
                  </button>
                </div>
              )}

              {step === "summary" && (
                <div className="space-y-6">
                  {triageError && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
                      {triageError}
                    </div>
                  )}
                  <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <AlertTriangle size={24} className="shrink-0" />
                    <p className="text-xs font-bold uppercase leading-tight">{t.presentImmediately}</p>
                  </div>

                  <div className="relative space-y-6 rounded-[2rem] bg-slate-900 p-8 text-white shadow-2xl">
                    <div className="absolute right-8 top-6 opacity-20">
                      <Activity size={40} />
                    </div>

                    <div>
                      <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.triageScore}</h3>
                      <p className="text-2xl font-black text-red-500">
                        {activeCase ? getCaseTriageLabel(activeCase) : t.triageLevel(medicalData.severity)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-4">
                      <div className="col-span-2">
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.fullName}</h3>
                        <p className="text-lg font-bold uppercase">{medicalData.name || t.unspecified}</p>
                      </div>
                      <div>
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.birthDateLabel}</h3>
                        <p className="text-sm font-bold text-slate-300">{medicalData.birthDate || t.unspecified}</p>
                      </div>
                      <div>
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.idCheckLabel}</h3>
                        <p className="text-sm font-bold text-slate-300">{maskIdNumber(medicalData.idNumber)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.location}</h3>
                        <p className="text-xl font-bold uppercase">
                          {medicalData.painLocation.length > 0 ? medicalData.painLocation.join(", ") : t.unspecified}
                        </p>
                      </div>
                      <div>
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.painIndex}</h3>
                        <p className="text-xl font-bold">{medicalData.severity}/10</p>
                      </div>
                      <div className="col-span-2">
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.feelingOnset}</h3>
                        <p className="text-xl font-bold uppercase">
                          {(medicalData.painType === t.other ? medicalData.painTypeOther : medicalData.painType) || t.unspecified} • {(medicalData.onset === t.other ? medicalData.onsetOther : medicalData.onset) || t.unspecified}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-slate-800 pt-4">
                      <div>
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.updateLostConsciousness}</h3>
                        <p className="text-sm font-bold text-slate-300">{medicalData.lostConsciousness || t.unspecified}</p>
                      </div>
                      <div>
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.updateBreathing}</h3>
                        <p className="text-sm font-bold text-slate-300">{medicalData.breathingDifficulty || t.unspecified}</p>
                      </div>
                      <div>
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.updateOtherLabel}</h3>
                        <p className="text-sm font-bold text-slate-300">{medicalData.updateOther || t.noneReported}</p>
                      </div>
                      <div>
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.additionalInfoLabel}</h3>
                        <p className="text-sm font-bold text-slate-300">{medicalData.additionalInfo || t.noneReported}</p>
                      </div>
                      <div>
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.followUpSummary}</h3>
                        <p className="text-sm font-bold text-slate-300">
                          {(medicalData.followUpAnswer === t.other ? medicalData.followUpOther : medicalData.followUpAnswer) || t.unspecified}
                        </p>
                      </div>
                      <div>
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.history}</h3>
                        <p className="text-sm font-bold text-slate-300">
                          {getDisplayList(medicalData.history, medicalData.historyOther).length > 0
                            ? getDisplayList(medicalData.history, medicalData.historyOther).join(", ")
                            : t.noneReported}
                        </p>
                      </div>
                      <div>
                        <h3 className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{t.allergies}</h3>
                        <p className="text-sm font-bold text-slate-300">
                          {getDisplayList(medicalData.allergies, medicalData.allergiesOther).length > 0
                            ? getDisplayList(medicalData.allergies, medicalData.allergiesOther).join(", ")
                            : t.noneReported}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep("edit")}
                    className="w-full rounded-2xl border-2 border-red-100 bg-red-50 py-4 text-xs font-bold uppercase tracking-widest text-red-600"
                  >
                    {t.updateInfo}
                  </button>

                  <button
                    type="button"
                    onClick={resetSession}
                    className="w-full rounded-2xl border-2 border-slate-100 py-4 text-xs font-bold uppercase tracking-widest text-slate-400"
                  >
                    {t.clearSession}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {view === "patient" && showBackNav && (
          <div className="flex shrink-0 items-center gap-4 border-t border-slate-100 bg-white p-6">
            <button
              type="button"
              onClick={() => {
                if (step === "login") setStep("language");
                if (step === "profile") setStep("language");
                if (step === "symptoms") setStep("profile");
                if (step === "followup") setStep("symptoms");
              }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="h-2 flex-grow overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-red-600 transition-all duration-500"
                style={{
                  width:
                    step === "login"
                      ? "20%"
                      : step === "profile"
                        ? "40%"
                        : step === "symptoms"
                          ? "60%"
                          : step === "followup"
                            ? "80%"
                            : "20%"
                }}
              />
            </div>
          </div>
        )}
        {view === "nurse" && selectedQueueSection && (
        <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 pb-4 pt-16 backdrop-blur-sm">
          <div className="flex max-h-[calc(100%-2rem)] w-full flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="shrink-0 flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${selectedQueueSection.tone}`}>
                    {t[selectedQueueSection.titleKey]}
                  </span>
                  <span className="text-lg font-black text-slate-400">{selectedQueueSection.cases.length}</span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{t[selectedQueueSection.helpKey]}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedQueueSectionId(null);
                  setActiveCaseId(null);
                }}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600"
              >
                {t.close}
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {selectedQueueSection.cases.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm font-semibold text-slate-400">
                  No cases in this group.
                </div>
              ) : (
                selectedQueueSection.cases.map((item) => renderNurseCaseCard(item))
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default App;
