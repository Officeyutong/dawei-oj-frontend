import { useRef } from "react"
import { Button } from "semantic-ui-react"

const OnlineVMPage: React.FC<{ url: string }> = ({ url }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  let iframeURL = 'https://img.qcloud.com/qcloud/app/active_vnc/index.html?InstanceVncUrl='
  let param = 'wss%3A%2F%2Fshvnc.qcloud.com%3A26789%2Fvnc%3Fs%3DRmxjenBIdnpwbkJROUFralVPVEowSEw3NnN6eFpMd2ZUekpOYnBLcmExMDFiSDZsMkxOS0FhZUU3dXZIaGlUME5xb29IWUhJbnAvd0pDRzVYTWNjNGxYRXp4dkttNUZVRUYwMVFXY3RWZ1k9%26password%3D%26isWindows%3Dfalse%26isUbuntu%3Dtrue'
  const handleFullScreen = () => {
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen()
    }
  }
  return (<>
    <div id='screen' style={{ width: "700px", height: "700px", display: "flex" }}>
      <iframe ref={iframeRef} title='vmiframe' src={iframeURL + param} scrolling="no" frameBorder="no" allowFullScreen={true} style={{ width: '100%' }}></iframe>

    </div>
    <Button style={{ postion: 'absolute' }} onClick={handleFullScreen}>全屏</Button>
  </>)
}

export default OnlineVMPage