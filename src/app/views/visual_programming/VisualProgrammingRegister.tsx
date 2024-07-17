import { Grid, GridColumn, Image } from "semantic-ui-react";
import { useBackgroundColor, useDocumentTitle } from "../../common/Utils";
import Logo from "./assets/logo.png"
import Cat from "./assets/cat.png"

const VisualProgrammingRegister: React.FC<{}> = () => {
  useBackgroundColor('#d6eefa')
  useDocumentTitle("注册账号");
  return (<>
    <Image src={Logo} style={{ position: "absolute", margin: '20px' }}></Image>
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10vh' }}>

      <div style={{ backgroundColor: '#67aeda', width: '80%', borderRadius: '30px', border: '0.3rem solid', borderColor: 'white', boxShadow: '-5px 5px 5px 	#8e9ea6' }}>
        <div style={{ height: '70vh' }}>
          <Grid>
            <GridColumn width={12} style={{ height: '70vh', paddingBottom: "0" }} >
              <div style={{ backgroundColor: 'white', borderRadius: '25px', height: '100%' }}>
                <p>qq</p>
                <p>qq</p>
                <p>qq</p>
                <p>qq</p>
                <p>qq</p>
              </div>
            </GridColumn>
            <GridColumn width={4} style={{ height: '70vh', paddingBottom: "0" }}>
              <Image src={Cat} style={{ height: "35%", width: "55%", position: 'absolute', bottom: '0', right: '20px' }}></Image>
            </GridColumn>
          </Grid>
        </div>
      </div>
    </div >
  </>)
};

export default VisualProgrammingRegister
