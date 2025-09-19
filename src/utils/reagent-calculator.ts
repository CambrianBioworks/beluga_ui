// utils/reagent-calculator.ts

interface ReagentFormulas {
  [key: string]: {
    reagents: { [key: string]: number };
    tips: { [key: string]: number };
  };
}

const formulas: ReagentFormulas = {
  "Whole Blood DNA": {
    reagents: {
      "LE Buffer": 30, // µl per sample
      "Proteinase K": 30, // µl per sample
      "Lysis Buffer": 200, // µl per sample
      "Wash Buffer 3": 300, // µl per sample
    },
    tips: {
      "200µL tips": 5, // per sample
      "1000µL tips": 1, // per sample
    },
  },
  "cfDNA": {
    reagents: {
      "Proteinase K": 160, // µl per sample
      "Lysis Buffer": 100, // µl per sample
      "Beads": 80, // µl per sample
      "Binding Buffer": 5000, // µl per sample (5ml)
      "Wash Buffer 2": 1000, // µl per sample (1ml)
    },
    tips: {
      "200µL tips": 3, // per sample
      "1000µL tips": 8, // per sample
    },
  },
  // Add more sample types as needed
  "Fresh Tissue DNA": {
    reagents: {},
    tips: {},
  },
  "Stool DNA": {
    reagents: {},
    tips: {},
  },
};

export function calculateReagents(sampleType: string, numberOfSamples: number) {
  const formula = formulas[sampleType];
  
  if (!formula || numberOfSamples <= 0) {
    return {
      reagentVolumes: [],
      pipetteTips: [],
    };
  }

  // Calculate reagent volumes
  const reagentVolumes: string[] = [];
  Object.entries(formula.reagents).forEach(([reagentName, volumePerSample]) => {
    const totalVolume = volumePerSample * numberOfSamples;
    
    // Format the volume with appropriate units
    let formattedVolume = "";
    if (totalVolume >= 1000) {
      formattedVolume = `${reagentName}: ${(totalVolume / 1000).toFixed(1)} mL`;
    } else {
      formattedVolume = `${reagentName}: ${totalVolume} µL`;
    }
    
    reagentVolumes.push(formattedVolume);
  });

  // Calculate pipette tips
  const pipetteTips: string[] = [];
  Object.entries(formula.tips).forEach(([tipType, tipsPerSample]) => {
    const totalTips = tipsPerSample * numberOfSamples;
    pipetteTips.push(`${tipType}: ${totalTips}`);
  });

  return {
    reagentVolumes,
    pipetteTips,
  };
}