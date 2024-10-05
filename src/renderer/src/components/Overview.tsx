import { useSubscribe } from '../pa2/hooks'

// "Compressor": "Off",
// "More": "50%",
// "Threshold": "-16.0dB",
// "Ratio": "1.4:1",
// "Gain": "0.0dB",
// "OverEasy": "Off",
// "ThresholdMeter": "Under",
// "GainReductionMeter": "0.0dB",
// "MaxInputLevel": "0.0dB",
// "CompressorType": "dbx 1066",

export const Overview = () => {
  const inputMixing = useSubscribe(['Node', 'SetupWizardStoredChoices', 'SV', 'InputMixing'])

  const mainSpeakerMode = useSubscribe([
    'Node',
    'SetupWizardStoredChoices',
    'SV',
    'MainSpeakerMode'
  ])

  const usingSubSpeaker = useSubscribe([
    'Node',
    'SetupWizardStoredChoices',
    'SV',
    'UsingSubSpeaker'
  ])

  const subMode = useSubscribe(['Node', 'SetupWizardStoredChoices', 'SV', 'SubSpeakerMode'])

  const instanceName = useSubscribe(['Node', 'AT', 'Instance_Name'])
  const softwareVersion = useSubscribe(['Node', 'AT', 'Software_Version'])

  const subDescription = usingSubSpeaker === 'Yes' ? `+ Sub(${subMode})` : ''
  const description = `${inputMixing} ${mainSpeakerMode} ${subDescription}`

  return (
    <code className="overview">
      {instanceName} @ {softwareVersion} - {description}
    </code>
  )
}
