import React, { Fragment } from 'react';
import { BarChart } from 'react-d3-components';
import { Loader, Segment } from 'semantic-ui-react'
import Axios from 'axios';

class BarGraph extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showLoader: true,
            data: [{
                label: 'somethingA',
                values: [{ x: 'SomgA', y: 10 }, { x: 'SomethingB', y: 4.5 }, { x: 'SomethingC', y: 3 }]
            }]
        }

        this.networkCallHandler = this.networkCallHandler.bind(this);

    }

    networkCallHandler() {
        Axios.get(`http://172.16.0.137:1235/ML/getIdeaRatings`)
            .then((res) => {
                console.log(res.data)
                let user_rating = [];

                res.data.adjusted_ratings.map((obj) => {
                    let value = obj.Rating;
                    user_rating.push({ x: obj.Idea, y: value });
                })

                let set_object = [{
                    label: 'sdfdsf',
                    values: user_rating
                }]

                console.log(set_object);

                this.setState({
                    data: set_object
                })

            })
    }

    renderGrpah = () => {
        setTimeout(() => {
            console.log("setting the state");
            this.setState({
                showLoader: false
            })
        }, 2000)
    }


    componentDidMount() {
        console.log("component didmount is called");
        this.networkCallHandler();
    }

    render() {
        return (
            <Fragment > 
                {this.state.showLoader ?
                    <Segment style={{ width: "inherit", height: "20vh" }} >
                        {this.renderGrpah()}
                        <Loader content="Preparing Graphs for you" active />
                    </Segment>
                    :
                    (<div>
                        <h3 style={{ color: "grey", fontFamily: "sans", marginLeft: "18vw" }}> Idea vs ratings</h3>
                        <BarChart
                            data={this.state.data}
                            width={600}
                            height={400}
                            margin={{ top: 10, bottom: 50, left: 90, right: 10 }} />
                    </div>)
                }
            </Fragment>
        );
    }
}


export default BarGraph;