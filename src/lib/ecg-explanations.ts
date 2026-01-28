/**
 * ECG Explanations - Educational content for Premium feedback
 * Source: /Users/josealencar/Downloads/ecg_achados_explicacoes.txt
 */

export interface ECGExplanation {
  description: string
}

// RHYTHM EXPLANATIONS (18 entries)
export const RHYTHM_EXPLANATIONS: Record<string, ECGExplanation> = {
  sinus: {
    description: "Onda P positiva em D1, D2, aVF; plus-minus ou minus em V1; positiva em V6. FC entre 50-100 bpm."
  },
  sinus_arrhythmia: {
    description: "Ritmo sinusal com variação do intervalo RR > 10%, geralmente relacionada à respiração."
  },
  sinus_bradycardia: {
    description: "Ritmo sinusal com frequência cardíaca < 50 bpm. Pode ser fisiológica (atletas) ou patológica."
  },
  sinus_tachycardia: {
    description: "Ritmo sinusal com FC > 100 bpm."
  },
  sinus_pause: {
    description: "Ausencia temporaria do no sinusal, pausa > 2s, nao e multiplo do PP."
  },
  ectopic_atrial: {
    description: "Ritmo fora do no sinusal, P com morfologia diferente (nao e plus-minus/minus em V1)."
  },
  afib: {
    description: "Ausência de ondas P organizadas, intervalos RR irregulares e ondas fibrilatórias (f) na linha de base."
  },
  aflutter: {
    description: "Ritmo atrial organizado com ondas F em \"dente de serra\" (~300 bpm), geralmente com bloqueio AV 2:1 resultando em FC ~150 bpm."
  },
  svt: {
    description: "Taquicardia com QRS estreito, regular, geralmente por reentrada. Intervalo RP tipicamente longo."
  },
  mat: {
    description: "≥3 morfologias distintas de onda P na mesma derivação, FC > 90-100 bpm, intervalos PP, PR e RR variáveis."
  },
  vtach: {
    description: "Taquicardia com QRS largo (>120ms), pode ser monomórfica ou polimórfica, sustentada ou não sustentada."
  },
  polymorphic_vtach: {
    description: "TV com morfologia do QRS variável, pode indicar isquemia ativa ou TVPC (catecolaminérgica)."
  },
  torsades: {
    description: "TV polimórfica associada a QT longo, com rotação gradual do eixo dos complexos QRS ao redor da linha de base."
  },
  vfib: {
    description: "Ritmo caótico e desorganizado (>300 bpm), sem complexos QRS definidos. Emergência - ausência de pulso."
  },
  junctional: {
    description: "Ritmo de escape originado no nó AV com FC 40-60 bpm, QRS geralmente estreito, ondas P ausentes ou retrógradas."
  },
  ventricular_escape: {
    description: "Ritmo de escape com origem ventricular, FC < 40 bpm, QRS largo."
  },
  riva: {
    description: "Ritmo ventricular com FC entre 50-100 bpm, comum após reperfusão coronariana."
  },
  paced: {
    description: "Espículas de marcapasso precedendo complexos atriais e/ou ventriculares, dependendo do tipo de dispositivo."
  },
  asystole: {
    description: "Ausência total de atividade elétrica cardíaca - linha isoelétrica. Confirmar em múltiplas derivações."
  },
  isorhythmic_dissociation: {
    description: "Coexistência de ritmo sinusal e juncional com frequências semelhantes, sem relação entre ondas P e QRS."
  },
  other: {
    description: "Ritmo não classificado nas categorias padrão. Avaliar características específicas do traçado."
  }
}

// FINDING EXPLANATIONS
export const FINDING_EXPLANATIONS: Record<string, ECGExplanation> = {
  // Câmaras
  amplitude_criteria: {
    description: "Graded MESA - SV1 + SV2 + RV5 ≥ 40 = sugere, ≥ 50 = aponta fortemente para aumento de massa ventricular esquerda (HVE). Também é índice prognóstico."
  },
  tall_r_right_precordial: {
    description: "R em V1 > 7mm ou R/S > 1 em V1. Sugere SVD, mas critérios têm baixa acurácia."
  },
  left_atrial_enlargement: {
    description: "Sinal de Morris (único critério válido): porção negativa da P em V1 > 1mm em duração e amplitude. P larga (>120ms) NÃO é SAE, é bloqueio interatrial."
  },
  right_atrial_enlargement: {
    description: "P > 2,5mm em D2, D3, aVF ou porção positiva da P em V1 > 1,5mm."
  },
  low_voltage: {
    description: "QRS < 5mm no plano frontal ou < 10mm nas precordiais. Causas: derrame pericárdico, DPOC, obesidade, etc."
  },

  // Condução
  rbbb: {
    description: "QRS ≥ 120ms, padrão rsR' (\"orelhas de coelho\") ou R puro em V1 ou qR em V1, S empastada em D1/V6."
  },
  lbbb: {
    description: "QRS ≥ 120ms (Strauss: >130ms mulheres, >140ms homens), QRS negativo em V1, OBRIGATÓRIO: \"torres de xadrez\" em ≥2 derivações (D1, aVL, V1, V2, V5 ou V6)."
  },
  lafb: {
    description: "Desvio do eixo para esquerda além de -45°, S(D3) > S(D2). NÃO existem bloqueios divisionais direitos."
  },
  lpfb: {
    description: "Desvio do eixo para direita, R(D3) > R(D2). Excluir SVD e biotipo longilíneo."
  },
  interatrial_block: {
    description: "P > 120ms. 1º grau: P prolongada bifásica em inferiores. Avançado: P plus-minus em D2, D3, aVF."
  },
  ivcd: {
    description: "QRS largo sem criterios caracteristicos de BRE ou BRD."
  },
  incomplete_rbbb: {
    description: "QRS entre 100-119ms com padrão rsR' em V1. NÃO existe 'atraso de condução' ou 'distúrbio de condução do ramo direito' - termos obsoletos."
  },
  ashman_phenomenon: {
    description: "Aberrância de condução quando estímulo supraventricular prematuro (RR curto) segue RR longo, encontrando His-Purkinje ainda refratário. QRS alargado, geralmente com morfologia de BRD. Diferencia de EV por: onda P precedente, acoplamento variável, ausência de pausa compensatória."
  },

  // Bloqueios AV
  avb_1st: {
    description: "PR > 200ms com todas as ondas P conduzidas."
  },
  avb_2nd_type1: {
    description: "Aumento progressivo do PR até uma P bloqueada, seguido de encurtamento do PR (Wenckebach)."
  },
  avb_2nd_type2: {
    description: "P bloqueada subitamente sem aumento progressivo do PR. Mais grave, frequentemente infranodal."
  },
  avb_3rd: {
    description: "Dissociação AV completa. Átrios e ventrículos batem independentemente. Ritmo de escape assume."
  },
  avb_2_1: {
    description: "Uma onda P bloqueada seguida de uma onda P que conduz um QRS, com intervalos PQ sempre iguais."
  },
  avb_advanced: {
    description: "Bloqueios maiores que 2:1, mas que ainda possuem alguns PQs iguais durante o tracado (indicando conducao preservada intermitente)."
  },

  // Bloqueios SA
  sab_2nd_type1: {
    description: "Encurtamento progressivo do intervalo PP até uma pausa (Wenckebach sinoatrial)."
  },
  sab_2nd_type2: {
    description: "Ausência súbita de onda P com pausa = ~2x o ciclo PP precedente."
  },
  sab_3rd: {
    description: "Ausência completa de condução sinoatrial. Ritmo de escape assume."
  },

  // Extrassístoles
  ventricular_extrasystole: {
    description: "Batimento prematuro de origem ventricular, QRS largo (>120ms), geralmente sem onda P precedente."
  },
  supraventricular_extrasystole: {
    description: "Batimento prematuro atrial ou juncional, onda P precoce com morfologia diferente da sinusal, QRS geralmente estreito."
  },

  // Infarto Oclusivo
  oca: {
    description: "Oclusão coronariana aguda. Identificar sinais isquêmicos (SST, T hiperaguda, de Winter, Aslanger, Sgarbossa) e localizar parede acometida."
  },
  ste: {
    description: "Elevação do ponto J. Baixa sensibilidade (43%). Padrão tombstone (convexo fundindo com T) e barbatana de tubarão (fusão QRS+ST+T) indicam mau prognóstico."
  },
  hyperacute_t: {
    description: "Sinal MAIS PRECOCE de OCA. Simétrica, base larga, às vezes ampla. Avaliar área sob a curva em relação ao QRS. ONDA T NEGATIVA NUNCA É ISQUEMIA AGUDA - é achado pós-isquêmico."
  },
  std_v1v4: {
    description: "\"Espelho\" de SST lateral. Indica OCA de circunflexa ou marginal. Fazer V7-V8-V9 para confirmar."
  },
  aslanger: {
    description: "IAM inferior sem critérios clássicos. Critérios: (1) SST em D3 mas NÃO em D2/aVF, (2) Infra em V4-V6 poupando V2 com T positiva, (3) ST de V1 > ST de V2."
  },
  de_winter: {
    description: "Oclusão da ADA. Infra de ST nas precordiais + T hiperagudas simultâneas, SEM supra clássico. 2-3% dos IAM anteriores. Homens jovens sem história de DAC."
  },
  subtle_ste: {
    description: "Elevação entre 0,1-0,9 mm. Presente em ~18% dos IAMCSST. Associado a doença multiarterial e atraso na reperfusão."
  },
  terminal_qrs_distortion: {
    description: "Ausência simultânea de onda S e onda J em V2 e/ou V3. 100% específico para diferenciar OCA de ADA vs repolarização precoce. Presente em ~19% dos IAM anteriores."
  },
  sgarbossa_modified: {
    description: "OCA com BRE. Positivo se: (1) SST concordante ≥1mm, (2) Infra concordante ≥1mm em V1-V3, ou (3) SST/S ≥0,25 ou Infra/R ≥0,25 (discordância excessiva)."
  },
  wellens: {
    description: "Achado POS-ISQUEMICO, T invertidas ou bifasicas."
  },
  avr_elevation_diffuse_std: {
    description: "Marcador de risco, nao diagnostico. Nao usar isoladamente para diagnosticar infarto."
  },

  // Sinais de Fibrose
  pathological_q: {
    description: "Duração > 30ms e profundidade > 1mm. Indica zona eletricamente inativa (necrose/fibrose)."
  },
  fragmented_qrs: {
    description: "Presença de R' adicional ou entalhes em R ou S em ≥2 derivações contíguas. Marcador de fibrose miocárdica."
  },

  // Repolarização
  secondary_t_wave: {
    description: "T negativa e assimétrica, causada por alterações no QRS (bloqueios de ramo, sobrecargas) ou na geometria ventricular."
  },
  primary_t_wave: {
    description: "T simétrica, de base larga (positiva ou negativa), ampla, com grande área sob a onda T. Indica alteração de canais iônicos. ONDA T NEGATIVA NUNCA É ISQUEMIA AGUDA."
  },
  early_repolarization: {
    description: "Supra de ST côncavo com entalhe no final do QRS (onda J). Variante normal, mas pode mimetizar isquemia."
  },
  giant_negative_t: {
    description: "T profundamente negativa (>10mm), simétrica. Causas: cardiomiopatia hipertrófica apical, causas cerebrais ou cardiocerebrais, pós-isquemia, Spiked Helmet Sign."
  },

  // Eletrólitos
  hyperkalemia: {
    description: "T apiculadas (\"em tenda\"), QRS alargado, ondas P achatadas/ausentes, padrão sinusoidal em casos graves."
  },
  hypokalemia: {
    description: "Achatamento da onda T, onda U proeminente, depressão de ST, prolongamento do QT."
  },

  // Medicamentos
  digitalis: {
    description: "Depressão de ST em \"colher\" ou \"bigode de Salvador Dalí\", QT encurtado, ondas T achatadas/invertidas."
  },

  // Outros
  preexcitation: {
    description: "Ativação ventricular precoce via acessória. Classicamente: PR curto + onda delta, mas vias típicas e atípicas podem fugir deste padrão."
  },
  brugada: {
    description: "Tipo 1: SST em V1-V3 com morfologia \"em tenda\" (coved). Tipos 2/3: padrão em sela (saddleback). Associado a morte súbita."
  },
  spodick_sign: {
    description: "Infradesnivelamento do segmento TP, sugestivo de pericardite aguda."
  },
  pq_depression: {
    description: "Depressão do segmento PQ, sugestivo de pericardite aguda ou infarto atrial."
  },
  spiked_helmet: {
    description: "Onda T negativa gigante com QT muito longo, em que o QRS no meio das ondas Ts parece a ponta do capacete prussiano."
  },
  dagger_q: {
    description: "Q estreita e profunda em derivações infero-laterais, descrita na cardiomiopatia hipertrófica septal."
  },
  normal: {
    description: "Ritmo sinusal, FC 50-100 bpm, eixo normal, intervalos PR/QRS/QT normais, sem alterações de ST-T ou ondas Q patológicas."
  },

  // Pacemaker
  pacemaker_normal: {
    description: "Funcionamento normal do marcapasso com captura e sensibilidade adequadas."
  },
  pacemaker_sense_failure: {
    description: "Falha de sensibilidade do marcapasso - o dispositivo não detecta a atividade cardíaca intrínseca."
  },
  pacemaker_pace_failure: {
    description: "Falha de captura do marcapasso - estímulo emitido mas não seguido de despolarização."
  },

  // Pediatric chamber findings
  ped_left_atrial_disease: {
    description: "DOENÇA ATRIAL ESQUERDA (DAE): Critérios de onda P são apenas de suporte. Uso isolado não prediz DAE em pediatria."
  },
  ped_left_ventricular_disease: {
    description: "DOENÇA VENTRICULAR ESQUERDA (DVE): Peguero-Lo Presti Modificado: <3a: ≥35mm | ≥3a: ≥49mm. Índice CHILDHEART (RI+RV6): ≥37mm (corte único para todas as idades). Sokolow-Lyon: Não significativo em pediatria."
  },
  ped_right_atrial_disease: {
    description: "ESCORE CHILDHEART - CÂMARAS DIREITAS: BRD (1pt) | R pura V1 (1pt) | q inicial V1 (1pt) | S>R V6 (1pt) | RV1+SV6 ≥18mm (2pts). ≥2: Rule-in | =1: Intermediário | 0: Rule-out"
  },
  ped_right_ventricular_disease: {
    description: "ESCORE CHILDHEART - CÂMARAS DIREITAS: BRD (1pt) | R pura V1 (1pt) | q inicial V1 (1pt) | S>R V6 (1pt) | RV1+SV6 ≥18mm (2pts). ≥2: Rule-in | =1: Intermediário | 0: Rule-out"
  }
}

// AGE PATTERN EXPLANATIONS (for pediatric ECGs)
export const AGE_PATTERN_EXPLANATIONS: Record<string, ECGExplanation> = {
  expected_for_age: {
    description: "ECG dentro do padrão esperado para a faixa etária."
  },
  outside_age_pattern: {
    description: "ECG fora do padrão esperado para a idade. Padrões por faixa etária: Neonatal (0-30d): Lacuna de evidência, usar aVF, V1, V6 para outliers. Lactente (1m-<3a): Dominância de VD esperada, eixo inferior, R≥S em V6, R dominante em V1 pode ser normal. Transição (3-8a): Fase mista, eixo inferior, R>S em V6, R em V1 modesta (<6mm se R>S). Padrão Adulto (≥8a): S>R em V1, R>S em V6 - falha = LR+ ~7,5 para doença."
  }
}

// AXIS EXPLANATIONS
export const AXIS_EXPLANATIONS: Record<string, ECGExplanation> = {
  normal: {
    description: "Entre -30° e +90°. D1 e D2 positivos."
  },
  left: {
    description: "Além de -30°. D1 positivo e D2 negativo. Primeira suspeita: BDAS."
  },
  right: {
    description: "Além de +90°. D1 negativo e D2 positivo. Primeira suspeita: BDPI (após excluir outras causas)."
  },
  extreme: {
    description: "QRS negativo em todas as derivações do plano frontal."
  }
}

// INTERVAL EXPLANATIONS
export const INTERVAL_EXPLANATIONS: Record<string, Record<string, ECGExplanation>> = {
  pr: {
    normal: { description: "120-200 ms (3-5 quadradinhos)." },
    prolonged: { description: "PR > 200 ms com condução AV 1:1 preservada (BAV 1º grau)." },
    short: { description: "PR < 120 ms. Pode indicar via acessória, mas nem toda pré-excitação tem PR curto." },
    na: { description: "Não aplicável - usado quando não há ondas P identificáveis (ex: FA)." }
  },
  qrs: {
    normal: { description: "≤ 100 ms." },
    wide: { description: "> 120 ms. Causas: bloqueios de ramo, pré-excitação, ritmos ventriculares, hipercalemia." }
  },
  qt: {
    normal: { description: "QTc entre 350-450 ms (homens) ou 350-460 ms (mulheres)." },
    short: { description: "QTc < 350 ms. Associado a risco de arritmias ventriculares." },
    prolonged: { description: "QTc > 480 ms. Risco de Torsades principalmente se ≥ 500 ms. Causas: medicamentos, distúrbios eletrolíticos, congênito." }
  }
}

// REGULARITY EXPLANATIONS
export const REGULARITY_EXPLANATIONS: Record<string, ECGExplanation> = {
  regular: {
    description: "Intervalos RR constantes (variação < 10%)."
  },
  irregular: {
    description: "Intervalos RR variáveis (variação > 10%), como na FA ou arritmia sinusal."
  }
}

// ELECTRODE SWAP EXPLANATIONS
export const ELECTRODE_SWAP_EXPLANATIONS: Record<string, ECGExplanation> = {
  swap_la_ra: {
    description: "Inversão de D1 (torna-se negativo), D2 e D3 trocam entre si. aVL e aVR trocam. Simula dextrocardia."
  },
  swap_la_ll: {
    description: "D2 e D3 trocam, aVL e aVF trocam. D1 inalterado."
  },
  swap_ra_ll: {
    description: "D1, D2 e D3 invertidos. Pode simular dextrocardia."
  },
  swap_rl_involved: {
    description: "A perna direita é o terra - trocas causam que D1, D2 ou D3 fiquem com linha reta semelhante a assistolia."
  },
  swap_precordial: {
    description: "Progressão anormal da onda R nas precordiais. \"Progressão lenta\" NÃO tem evidência para diagnóstico de fibrose."
  }
}

/**
 * Get explanation for a specific field and value
 */
export function getExplanation(field: string, value: string): ECGExplanation | null {
  switch (field) {
    case 'rhythm':
      return RHYTHM_EXPLANATIONS[value] || null
    case 'findings':
      return FINDING_EXPLANATIONS[value] || null
    case 'axis':
      return AXIS_EXPLANATIONS[value] || null
    case 'regularity':
      return REGULARITY_EXPLANATIONS[value] || null
    case 'electrode_swap':
      return ELECTRODE_SWAP_EXPLANATIONS[value] || null
    case 'pr_interval':
      return INTERVAL_EXPLANATIONS.pr[value] || null
    case 'qrs_duration':
      return INTERVAL_EXPLANATIONS.qrs[value] || null
    case 'qt_interval':
      return INTERVAL_EXPLANATIONS.qt[value] || null
    default:
      return null
  }
}

/**
 * Get explanations for an array of values (e.g., findings array)
 */
export function getExplanationsForArray(field: string, values: string[]): Record<string, ECGExplanation> {
  const explanations: Record<string, ECGExplanation> = {}
  for (const value of values) {
    const explanation = getExplanation(field, value)
    if (explanation) {
      explanations[value] = explanation
    }
  }
  return explanations
}
