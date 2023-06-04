import React, {useEffect, useMemo, useRef, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import LoadingData from "../components/LoadingData";
import moment from "moment/moment";
import * as echarts from 'echarts';
import {
    TooltipComponent,
    GridComponent,
    LegendComponent,
    LegendScrollComponent,
    LegendPlainComponent
} from 'echarts/components';
import {BarChart} from 'echarts/charts';
import {CanvasRenderer} from 'echarts/renderers';
import ReactEcharts from "echarts-for-react";
import custom_theme from "../js/customed.json";
import {toast} from "react-toastify";
import Toast from "../components/Toast";

import FsLightbox from "fslightbox-react";
import Masonry from "react-masonry-css";

import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

/**
 * Echarts register theme and initial configuration.
 * */
echarts.registerTheme('customed', custom_theme)
echarts.use([TooltipComponent, GridComponent, LegendComponent, LegendScrollComponent, LegendPlainComponent, BarChart, CanvasRenderer]);

/**
 * Iteration page component for displaying information about single run and model.
 * */

function Iteration(props) {

    console.log("[FOR DEBUGGING PURPOSES]: ITERATION VIEW !")

    const [lightBox, setLightBox] = useState({
        isOpen: false,
        key: 1
    });

    /**
     * Masonry Grid breakpoints definitions.
     * UseMemo is used for optimization purposes.
     * */
    const breakpointColumnsObj = useMemo(() => {
        return {
            default: 4,
            1399: 3,
            991: 2,
            575: 1
        }
    })

    /**
     * Get :project_id, :experiment_id, :iteration_id params from url.
     * */
    const {project_id, experiment_id, iteration_id} = useParams();

    /**
     * State used for storing information about iteration.
     * */
    const [iterationData, setIterationData] = useState();

    /**
     * Function used for redirecting.
     * */
    let navigate = useNavigate();

    /**
     * React location hook.
     * */
    let location = useLocation();

    /**
     * REST API request for iteration data based on url params (:project_id, :experiment_id, :iteration_id).
     * If project, experiment or iteration based on url params don't exist, user will be redirected to main page.
     * */
    useEffect(() => {
        setIterationData(null)
        fetch('http://localhost:8000/projects/' + project_id + '/experiments/' + experiment_id + '/iterations/' + iteration_id)
            .then(response => {
                if (response.ok) {
                    return response.json()
                }
                return Promise.reject(response);
            })
            .then(data => {
                setIterationData(data)
            })
            .catch((response) => {
                navigate('/projects')
            });

    }, [location.pathname]);

    /**
     * Prepare data from REST API request to displayable form.
     * @ parameters_names: array of parameters names
     * @ parameters_values: array of parameters values
     * @ metrics_names: array of metrics names
     * @ metrics_values: array of metrics values
     * @ metrics_chart_options: configuration of metrics chart
     * UseMemo is used for optimization purposes.
     * */
    const [parameters_names, parameters_values, metrics_names, metrics_values, metrics_chart_options, custom_charts] = useMemo(() => {
        let parameters_names
        let parameters_values
        let metrics_names
        let metrics_values
        let metrics_chart_options
        let custom_charts = []

        if (iterationData) {
            if (iterationData.parameters) {
                parameters_names = Object.getOwnPropertyNames(iterationData.parameters)
                parameters_values = Object.values(iterationData.parameters)
            }
            if (iterationData.metrics) {
                metrics_names = Object.getOwnPropertyNames(iterationData.metrics)
                metrics_values = Object.values(iterationData.metrics)
                if (metrics_names.length > 0) {
                    let series = metrics_names.map((name, index) => {
                        let data = Array(metrics_names.length).fill(0)
                        data[index] = metrics_values[index]
                        return {
                            name: name,
                            data: data,
                            type: 'bar',
                            stack: 'stack',
                        }
                    })
                    metrics_chart_options = {
                        toolbox: {
                            show: true,
                            feature: {
                                dataZoom: {
                                    show: true,
                                    yAxisIndex: "none"
                                },
                                brush: {
                                    type: 'polygon',
                                },
                                restore: {
                                    show: true,
                                },
                                saveAsImage: {},
                            }
                        },
                        title: {
                            left: 'center',
                            text: "Metric Chart"
                        },
                        tooltip: {},
                        xAxis: {
                            type: "category",
                            data: metrics_names
                        },
                        yAxis: {
                            type: 'value'
                        },
                        legend: {
                            data: metrics_names,
                            top: 'bottom'
                        },
                        series: series
                    };
                }
            }
            if (iterationData.interactive_charts) {
                iterationData.interactive_charts.forEach(chart_data => {
                    let options;

                    if (chart_data.chart_type === 'scatter') {
                        let data = []

                        var callback = (args) => {
                            return args.marker + args.seriesName + ' (' + args.dataIndex +')<br />' + '(' + args.data.join(', ') + ')'
                        }

                        chart_data.x_data.forEach((value, index) => {
                            data.push([chart_data.x_data[index], chart_data.y_data[index]])
                        })

                        options = {
                            toolbox: {
                                feature: {
                                    dataZoom: {
                                        show: true,
                                        yAxisIndex: 0
                                    },
                                    brush: {
                                        type: 'polygon',
                                    },
                                    restore: {
                                        show: true,
                                    },
                                    saveAsImage: {},
                                }
                            },
                            title: {
                                left: 'center',
                                text: chart_data.chart_name ? chart_data.chart_name : '',
                            },
                            tooltip: {
                                trigger: 'item',
                                formatter: callback,
                            },
                            legend: {
                                top: 'bottom'
                            },
                            yAxis: {
                                type: 'value',
                                name: chart_data.y_label,
                                nameLocation: 'center',
                                nameGap: 30,
                            },
                            xAxis: {
                                type: 'value',
                                name: chart_data.x_label,
                                nameLocation: 'center',
                                nameGap: 30,
                            },
                            series: [
                                {
                                    name: iterationData.iteration_name,
                                    data: data,
                                    type: chart_data.chart_type,
                                },
                            ]
                        }
                        custom_charts.push(
                            <div className="card p-2">
                                <ReactEcharts option={options} theme="customed"/>
                            </div>
                        )
                    } else if (chart_data.chart_type === 'line') {

                        let data = []

                        var callback = (args) => {
                            return args[0].marker + args[0].seriesName + ' (' + args[0].dataIndex +')<br />' + '(' + args[0].data.join(', ') + ')'
                        }

                        chart_data.x_data.forEach((value, index) => {
                            data.push([chart_data.x_data[index], chart_data.y_data[index]])
                        })

                        options = {
                            toolbox: {
                                feature: {
                                    dataZoom: {
                                        show: true,
                                        yAxisIndex: "none"
                                    },
                                    brush: {
                                        type: 'polygon',
                                    },
                                    restore: {
                                        show: true,
                                    },
                                    saveAsImage: {},
                                }
                            },
                            title: {
                                left: 'center',
                                text: chart_data.chart_name ? chart_data.chart_name : '',
                            },
                            tooltip: {
                                trigger: 'axis',
                                formatter: callback,
                            },
                            legend: {
                                top: 'bottom'
                            },
                            yAxis: {
                                type: 'value',
                                name: chart_data.y_label,
                                nameLocation: 'center',
                                nameGap: 30,
                            },
                            xAxis: {
                                type: 'value',
                                name: chart_data.x_label,
                                nameLocation: 'center',
                                nameGap: 30,
                            },
                            series: [
                                {
                                    name: iterationData.iteration_name,
                                    data: data,
                                    type: chart_data.chart_type,
                                    showSymbol: false
                                },
                            ]
                        }
                        custom_charts.push(
                            <div className="card p-2">
                                <ReactEcharts option={options} theme="customed"/>
                            </div>
                        )
                    } else if (chart_data.chart_type === 'bar') {
                        options = {
                            toolbox: {
                                feature: {
                                    dataZoom: {
                                        show: true,
                                        yAxisIndex: "none"
                                    },
                                    brush: {
                                        type: 'polygon',
                                    },
                                    restore: {
                                        show: true,
                                    },
                                    saveAsImage: {},
                                }
                            },
                            title: {
                                left: 'center',
                                text: chart_data.chart_name ? chart_data.chart_name : '',
                            },
                            tooltip: {
                                trigger: 'item',
                            },
                            legend: {
                                top: 'bottom'
                            },
                            yAxis: {
                                type: 'value',
                                name: chart_data.y_label,
                                nameLocation: 'center',
                                nameGap: 30,
                            },
                            xAxis: {
                                type: 'category',
                                data: chart_data.x_data,
                                name: chart_data.x_label,
                                nameLocation: 'center',
                                nameGap: 30,
                            },
                            series: [
                                {
                                    name: iterationData.iteration_name,
                                    data: chart_data.y_data,
                                    type: chart_data.chart_type,
                                },
                            ]
                        }
                        custom_charts.push(
                            <div className="card p-2">
                                <ReactEcharts option={options} theme="customed"/>
                            </div>
                        )
                    }
                })

            }

            return [parameters_names, parameters_values, metrics_names, metrics_values, metrics_chart_options, custom_charts]
        }
        return [null, null, null, null, null, null]
    }, [iterationData])

    const [image_charts, image_charts_sources] = useMemo(() => {
        if (iterationData) {
            let image_charts = []
            let image_charts_sources = []
            if (iterationData.image_charts) {
                iterationData.image_charts.forEach((image_chart, index) => {
                    if (image_chart.encoded_image.startsWith('/')) {
                        image_charts.push(
                            <div className="d-flex align-items-center justify-content-center w-100 p-2" style={{background: "#fff",borderRadius: 5 + "px", boxShadow: "0px 0 30px rgba(1, 41, 112, 0.1)", marginBottom: 30 + "px", cursor: "pointer"}}>
                                <img onClick={() => setLightBox(prevState => {
                                    return {
                                        isOpen: !prevState.isOpen,
                                        key: (index + 1)
                                    }
                                })} className="img-fluid" style={{maxHeight: 400 + "px"}} src={"data:image/jpeg;base64," + image_chart.encoded_image} alt={image_chart.name} title={image_chart.name} />
                            </div>
                        )
                        image_charts_sources.push("data:image/jpeg;base64," + image_chart.encoded_image)
                    } else if (image_chart.encoded_image.startsWith('i')) {
                        image_charts.push(
                            <div className="d-flex align-items-center justify-content-center w-100 p-2" style={{background: "#fff",borderRadius: 5 + "px", boxShadow: "0px 0 30px rgba(1, 41, 112, 0.1)", marginBottom: 30 + "px", cursor: "pointer"}}>
                                <img onClick={() => setLightBox(prevState => {
                                    return {
                                        isOpen: !prevState.isOpen,
                                        key: (index + 1)
                                    }
                                })} className="img-fluid" style={{maxHeight: 400 + "px"}} src={"data:image/png;base64," + image_chart.encoded_image} alt={image_chart.name} title={image_chart.name} />
                            </div>
                        )
                        image_charts_sources.push("data:image/png;base64," + image_chart.encoded_image)
                    } else if (image_chart.encoded_image.startsWith('R')) {
                        image_charts.push(
                            <div className="d-flex align-items-center justify-content-center w-100 p-2" style={{background: "#fff",borderRadius: 5 + "px", boxShadow: "0px 0 30px rgba(1, 41, 112, 0.1)", marginBottom: 30 + "px", cursor: "pointer"}}>
                                <img onClick={() => setLightBox(prevState => {
                                    return {
                                        isOpen: !prevState.isOpen,
                                        key: (index + 1)
                                    }
                                })} className="img-fluid" style={{maxHeight: 400 + "px"}} src={"data:image/gif;base64," + image_chart.encoded_image} alt={image_chart.name} title={image_chart.name} />
                            </div>
                        )
                        image_charts_sources.push("data:image/gif;base64," + image_chart.encoded_image)
                    } else if (image_chart.encoded_image.startsWith('Q')) {
                        image_charts.push(
                            <div className="d-flex align-items-center justify-content-center w-100 p-2" style={{background: "#fff",borderRadius: 5 + "px", boxShadow: "0px 0 30px rgba(1, 41, 112, 0.1)", marginBottom: 30 + "px", cursor: "pointer"}}>
                                <img onClick={() => setLightBox(prevState => {
                                    return {
                                        isOpen: !prevState.isOpen,
                                        key: (index + 1)
                                    }
                                })} className="img-fluid" style={{maxHeight: 400 + "px"}} src={"data:image/bmp;base64," + image_chart.encoded_image} alt={image_chart.name} title={image_chart.name} />
                            </div>
                        )
                        image_charts_sources.push("data:image/bmp;base64," + image_chart.encoded_image)
                    } else if (image_chart.encoded_image.startsWith('U')) {
                        image_charts.push(
                            <div className="d-flex align-items-center justify-content-center w-100 p-2" style={{background: "#fff",borderRadius: 5 + "px", boxShadow: "0px 0 30px rgba(1, 41, 112, 0.1)", marginBottom: 30 + "px", cursor: "pointer"}}>
                                <img onClick={() => setLightBox(prevState => {
                                    return {
                                        isOpen: !prevState.isOpen,
                                        key: (index + 1)
                                    }
                                })} className="img-fluid" style={{maxHeight: 400 + "px"}} src={"data:image/webp;base64," + image_chart.encoded_image} alt={image_chart.name} title={image_chart.name} />
                            </div>
                        )
                        image_charts_sources.push("data:image/webp;base64," + image_chart.encoded_image)
                    }
                })
                return [image_charts, image_charts_sources]
            }
        }
        return [null, null]
    },[iterationData, lightBox])

    console.log(iterationData)
    console.log(image_charts_sources)

    /**
     * Component rendering.
     * If iterationData is available, it returns single iteration view.
     * If not, it returns loading screen.
     * */
    if (iterationData) {
        return (
            <main id="content">

                <div className="page-path">
                    <h1 className="d-flex align-items-center">
                        <span className="fw-semibold">
                            {iterationData.iteration_name}
                        </span>
                        <span className="project-info-id d-flex align-items-center" style={{fontWeight: "normal"}}>
                            @{iterationData.id}
                            <span className="material-symbols-rounded" title="Copy iteration id" onClick={
                                () => {
                                    toast.success('Copied to clipboard!', {
                                        position: "bottom-center",
                                        autoClose: 1000,
                                        hideProgressBar: true,
                                        closeOnClick: true,
                                        pauseOnHover: false,
                                        draggable: true,
                                        progress: undefined,
                                        theme: "light",
                                    });
                                    navigator.clipboard.writeText(iterationData.id)
                                }
                            }>
                                content_copy
                            </span>
                        </span>
                    </h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a href="/projects">Projects</a></li>
                            <li className="breadcrumb-item">{iterationData.project_title}</li>
                            <li className="breadcrumb-item"><a
                                href={"/projects/" + project_id + "/experiments"}>Experiments</a></li>
                            <li className="breadcrumb-item">{iterationData.experiment_name}</li>
                            <li className="breadcrumb-item">Iteration</li>
                            <li className="breadcrumb-item active">{iterationData.iteration_name}</li>
                        </ol>
                    </nav>
                </div>

                <section className="iteration-view section content-data">
                    <h5><span className="fw-semibold">Iteration details</span></h5>
                    <p><span className="fst-italic">Tu mógłby być opis iteracji!</span></p>
                    <div className="card p-2 table-responsive">
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Creation Date</th>
                                    <th>Last Modification</th>
                                    <th>User</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>{moment(new Date(iterationData.created_at)).format("DD-MM-YYYY, HH:mm:ss")}</td>
                                    <td>{moment(new Date(iterationData.updated_at)).format("DD-MM-YYYY, HH:mm:ss")}</td>
                                    <td>{iterationData.user_name}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <h5><span className="fw-semibold">Model details</span></h5>
                    <div className="card p-2">
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Model Name</th>
                                    <th>Model Path</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>{iterationData.model_name}</td>
                                    <td>{iterationData.path_to_model !== "" ? iterationData.path_to_model : '-'}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <h5><span className="fw-semibold">Dataset details</span></h5>

                    { iterationData.dataset ?
                        <div className="card p-2">
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th>Dataset Name</th>
                                        <th>Dataset Version</th>
                                        <th>Dataset Path</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>{iterationData.dataset.name}</td>
                                        <td>{iterationData.dataset.version !== "" ? iterationData.dataset.version : '-'}</td>
                                        <td>{iterationData.dataset.path_to_dataset !== "" ? iterationData.dataset.path_to_dataset : '-'}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        :

                        <p><span className="fst-italic">No dataset details to show!</span></p>
                    }

                    <h5><span className="fw-semibold">Parameters</span></h5>

                    {parameters_names && parameters_names.length > 0 ?

                        <div className="card p-2">
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                    <tr>
                                        {parameters_names && parameters_names.map(param => <th key={param}
                                                                                               scope="col">{param}</th>)}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        {parameters_names && parameters_values.map(value => <td key={value}>{value}</td>)}
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        :

                        <p><span className="fst-italic">No parameters to show!</span></p>
                    }

                    <h5><span className="fw-semibold">Metrics</span></h5>

                    {metrics_names && metrics_names.length > 0 ?

                        <>
                            <div className="card p-2">
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                        <tr>
                                            {metrics_names.map(param => <th key={param} scope="col">{param}</th>)}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr>
                                            {metrics_values.map(value => <td key={value}>{value}</td>)}
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="card p-2">
                                <ReactEcharts option={metrics_chart_options} theme="customed"/>
                            </div>
                        </>

                        :

                        <p><span className="fst-italic">No metrics to show!</span></p>

                    }

                    <h5><span className="fw-semibold">Custom charts</span></h5>

                    {custom_charts.length > 0 ?
                        custom_charts

                        :

                        <p><span className="fst-italic">No custom charts to show!</span></p>
                    }

                    <h5><span className="fw-semibold">Image charts</span></h5>

                    {image_charts && image_charts.length > 0 ?

                        <>
                            <FsLightbox
                                toggler={lightBox.isOpen}
                                sources={image_charts_sources}
                                slide={lightBox.key}
                            />

                            <Masonry
                                breakpointCols={breakpointColumnsObj}
                                className="my-masonry-grid"
                                columnClassName="my-masonry-grid_column">
                                {image_charts}
                            </Masonry>

                        </>

                        :

                        <p><span className="fst-italic">No image charts to show!</span></p>
                    }

                </section>

                <Toast/>

            </main>
        )
    } else {
        return (
            <main id="content">

                <div className="page-path">
                    <h1>Iteration</h1>
                    <nav>
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item"><a href="/projects">Projects</a></li>
                            <li className="breadcrumb-item">...</li>
                            <li className="breadcrumb-item">Experiments</li>
                            <li className="breadcrumb-item">...</li>
                            <li className="breadcrumb-item">Iteration</li>
                            <li className="breadcrumb-item active">...</li>
                        </ol>
                    </nav>
                </div>

                <section className="iteration-view section content-data">

                    <LoadingData
                        icon={"labs"}
                        dataSection={"iteration"}
                    />

                </section>
            </main>

        );
    }
}

export default Iteration;