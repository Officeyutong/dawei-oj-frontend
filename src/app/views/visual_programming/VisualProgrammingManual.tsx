import logo from './assets/logo.png'
import { Dimmer, Grid, GridColumn, Image, Loader, Rail, Sticky } from 'semantic-ui-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { GlobalShowdownConfig } from '../../common/Markdown';
import ManualMarkdown from "./assets/scratch-manual.txt";
import showdownToc from 'showdown-toc-export';
import Showdown from 'showdown';
import axios from 'axios';
import { useBackgroundColor, useDocumentTitle } from '../../common/Utils';
import '../../LinkButton.css'
interface TOCEntry {
    anchor: string;
    level: number;
    text: string;

}
function decodeEntity(inputStr: string): string {
    var textarea = document.createElement('textarea');
    textarea.innerHTML = inputStr;
    return textarea.value;
}
const VisualProgrammingManual: React.FC<{}> = () => {
    const mainElement = useRef<HTMLDivElement>(null);
    useDocumentTitle("可视化课程学习方法")
    const [baseText, setBaseText] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (baseText === null) (async () => {
            try {
                setLoading(true);
                setBaseText((await axios.get(ManualMarkdown)).data);
            } catch { } finally {
                setLoading(false);
            }
        })();
    }, [baseText]);

    const [tocEntries, renderedText] = useMemo(() => {
        if (baseText === null) return [[], ""];
        const toc: TOCEntry[] = [];
        const converter = new Showdown.Converter({
            ...GlobalShowdownConfig,
            extensions: [...GlobalShowdownConfig.extensions!, showdownToc({ toc })]
        })
        const result = converter.makeHtml(baseText);
        return [toc, result];
    }, [baseText]);
    useBackgroundColor('#d6eefa')

    return (
        <>
            {loading && <Dimmer active><Loader active></Loader></Dimmer>}
            <Image style={{ position: 'absolute', top: '10px', left: '20px', userSelect: 'none' }} src={logo}></Image>
            <div style={{ marginTop: '100px', width: '90%' }} >
                <Grid>
                    <GridColumn width={5}>
                    </GridColumn>
                    <GridColumn width={11}>
                        <div ref={mainElement}>
                            <Rail position='left' style={{ width: '20vw' }}>
                                <Sticky context={mainElement.current} style={{ width: '100%' }}>

                                    <div style={{ position: 'relative', marginLeft: '-40%', backgroundColor: '#a6defa', padding: '0%', width: "150%" }}>
                                        {tocEntries.map((item) => {
                                            return (
                                                <div key={item.text} style={{ display: 'flex' }}>
                                                    <button style={{ paddingLeft: `${(item.level - 1) * 30 + 30}px`, fontSize: `${2 + -(item.level) * 0.25}vw`, marginTop: '3%', color: item.level === 1 ? "#de5f50" : 'black', textDecoration: 'none', fontWeight: 'bold' }} className="link-button" onClick={() => {
                                                        const anchor = document.getElementById(item.anchor);
                                                        if (anchor !== null) {
                                                            anchor.scrollIntoView(true)
                                                        }
                                                    }}>{decodeEntity(item.text).trim()}</button>
                                                </div>
                                            )
                                        })}
                                    </div>

                                </Sticky>
                            </Rail>
                            <div style={{ backgroundColor: 'white', padding: '5%', width: '100%' }} dangerouslySetInnerHTML={{ __html: renderedText }}>
                            </div>
                        </div>
                    </GridColumn>
                </Grid>
            </div >

        </>
    )
};

export default VisualProgrammingManual;
