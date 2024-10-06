import { useDspState } from '../pa2/hooks'

export const Overview = () => {
  const [inputMixing] = useDspState(['Node', 'SetupWizardStoredChoices', 'SV', 'InputMixing'])
  const [mainSpeakerMode] = useDspState(['Node', 'SetupWizardStoredChoices', 'SV', 'MainSpeakerMode'])
  const [usingSubSpeaker] = useDspState(['Node', 'SetupWizardStoredChoices', 'SV', 'UsingSubSpeaker'])
  const [subMode] = useDspState(['Node', 'SetupWizardStoredChoices', 'SV', 'SubSpeakerMode'])
  const [instanceName] = useDspState(['Node', 'AT', 'Instance_Name'])
  const [softwareVersion] = useDspState(['Node', 'AT', 'Software_Version'])

  const subDescription = usingSubSpeaker === 'Yes' ? `+ Sub(${subMode})` : ''
  const description = `${inputMixing} ${mainSpeakerMode} ${subDescription}`

  return (
    <code className="overview">
      {instanceName} @ {softwareVersion} - {description}
    </code>
  )
}
