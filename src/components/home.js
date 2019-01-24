import React, { Component, Fragment } from "react";
import "../css/graph.css";
import Navbar from "./navbar";
import DisplayGraph from "./graphs";
import axios from 'axios';
import SyntaxHighlighter from "react-syntax-highlighter";
import { docco } from "react-syntax-highlighter/dist/styles/hljs";
import { Container, Card, Form } from "semantic-ui-react";

export default class Graph extends Component {
  componentDidMount(){
    if (this.props.location.state == undefined) {
      this.props.history.push('/')
  }
  else {
      this.generateStartTelemetry(this.props.location.state);
      if (this.props.location.state.coinsGiven === undefined) {
          this.setState({ coins: 0 })
      }
      else {
          if (sessionStorage.getItem("coins") == null) {
              this.setState({ coins: this.props.location.state.coinsGiven })
          }
          else {
              this.setState({ coins: sessionStorage.getItem("coins") })
          }

      }
  }
  }


  generateStartTelemetry(visitorInfo) {
    const edata = { type: "bazaar", mode: "play" };
    // const did = machineIdSync();
    const telemetry = {
        eid: "DC_START",
        did: '98912984-c4e9-5ceb-8000-03882a0485e4',
        ets: (new Date()).getTime(),
        dimensions: {
            'visitorId': visitorInfo.code,
            'visitorName': visitorInfo.name,
            'stallId': "STA7",
            'stallName': "Bazaar",
            'ideaId': "IDE17",
            'ideaName': "Data Room",
            'edata': edata
        }
    }
    const event = telemetry;
    const request = {
        "events": [event]
    };

    console.log('telemetry request', request)

    axios.post(`http://52.172.188.118:3000/v1/telemetry`, request)
        .then(data => {
            console.log("telemetry registered successfully", data);
        }).catch(err => {
            console.log("telemetry registration error", err);
        })
}
  componentWillMount() {
    this.setState({
      options: [
        {
          id: "1",
          value: `experiment_name: Example1_Iris_Classification
          owner: sunbird
          inputs:
            raw_data: "inputs/iris.csv"
          outputs:
            report: 'outputs/model_report'
            model: 'outputs/model'
          graph:
            - node_name: split
              inputs: raw_data
              outputs: [train, test]
              operation: sklearn.Splitters
              arguments:
                model_args:
                  name: train_test_split
                  arguments:
                    test_size: 0.2
              imports:
                - [sklearn.model_selection, train_test_split]
            - node_name: model_logistic_regression
              inputs: split.train
              outputs: [report, model]
              operation: sklearn.CrossValidate
              arguments:
                model_args:
                  name: LogisticRegression
                  arguments:
                    max_iter: 200
                target_variable: Species
                cv_args:
                  cv: 5
              imports:
                - [sklearn.linear_model, LogisticRegression]`,
          text: "Java"
        },


        {
          id: "2",
          value:`experiment_name: Content_tagging
          owner: sunbird
          inputs:
            DS_DATA_HOME: /home/DS_DATA_HOME
            pathTotaxonomy: inputs/RevisedTaxonomy.csv
            categoryLookup: inputs/category_lookup.yaml
            pathTotriggerJson: inputs/Trigger_node_ip.json
            pathTocorpus: inputs/corpus

          outputs:
            dummy: /home/DS_DATA_HOME

          graph:
            - node_name: contentmeta_creation
              inputs: [DS_DATA_HOME, pathTotriggerJson]
              outputs: [pathTocontentMeta]
              operation: contentTagging.ContentmetaCreation
              arguments:
                copy_to: /home/DS_DATA_HOME
                file_name: contentMeta

            - node_name: content_to_text
              inputs: [contentmeta_creation.pathTocontentMeta]
              outputs: [timestamp_folder]
              operation: contentTagging.ContentToText
              arguments:
                range_start: 4
                range_end: 10
                num_of_processes: 1
                subset_contentMeta_by: youtube
                content_type:
                  youtube:
                    contentDownloadField: artifactUrl
                    video_to_speech: none
                    speech_to_text: googleAT
                    image_to_text: none
                    pdf_to_text: none
                    ecml_index_to_text: none
                  ecml:
                    contentDownloadField: downloadUrl
                    video_to_speech: ffmpeg
                    speech_to_text: googleAT
                    image_to_text: googleVision
                    pdf_to_text: PyPDF2
                    ecml_index_to_text: parse
                  pdf:
                    contentDownloadField: downloadUrl
                    video_to_speech: none
                    speech_to_text: none
                    image_to_text: none
                    pdf_to_text: PyPDF2
                    ecml_index_to_text: none

            - node_name: keyword_extraction
              inputs: [pathTotaxonomy, categoryLookup, content_to_text.timestamp_folder, pathTocorpus]
              outputs: [pathTocontentKeywords]
              operation: contentTagging.KeywordExtraction
              arguments:
                extract_keywords: tagme
                filter_criteria: none
                update_corpus: 0
                filter_score_val: 0.4
                num_keywords: 5

            - node_name: write_to_elastic_search
              inputs: [content_to_text.timestamp_folder]
              outputs: []
              operation: contentTagging.WriteToElasticSearch

            - node_name: corpus_creation
              inputs: [pathTotaxonomy, keyword_extraction.pathTocontentKeywords]
              outputs: [root_path, path_to_corpus]
              operation: contentTagging.CorpusCreation
              arguments:
                keyword_folder_name: tagme_none
                update_corpus: True
                word_preprocess:
                   delimitter: "_"
                   method: stem_lem

            - node_name: content_taxonomy_scoring
              inputs: [contentmeta_creation.pathTocontentMeta, pathTotaxonomy, corpus_creation.root_path, corpus_creation.path_to_corpus]
              outputs: [path_to_timestampFolder, path_to_distMeasure, path_to_domain_level]
              operation: contentTagging.ContentTaxonomyScoring
              arguments:
                keyword_extract_filter_by: tagme_none
                phrase_split: True
                min_words: 5
                distanceMeasure: jaccard
                embedding_method: none
                delimitter: "_"
                filter_by:
                  contentMeta:
                    column: subject
                    alignment_depth: none
                  taxonomy:
                    column: Subject
                    alignment_depth: Chapter Name

            - node_name: predict_tag
              inputs: [content_taxonomy_scoring.path_to_timestampFolder]
              outputs: [path_to_predictedTags]
              operation: contentTagging.PredictTag
              arguments:
                window: 5

            - node_name: generate_observed_tag
              inputs: [contentmeta_creation.pathTocontentMeta, pathTotaxonomy, content_taxonomy_scoring.path_to_timestampFolder]
              outputs: [path_to_timestampFolder, path_to_observedtag, path_to_predictedtag]
              operation: contentTagging.GenerateObservedTag
              arguments:
                window: 5
                level: Chapter Name
                tax_known_tag: Grade
                content_known_tag: gradeLevel

            - node_name: evaluation
              inputs: [generate_observed_tag.path_to_timestampFolder, generate_observed_tag.path_to_observedtag, generate_observed_tag.path_to_predictedtag]
              outputs: [path_to_agg_precision, path_to_nonagg_precision]
              operation: contentTagging.Evaluation
              arguments:
                window: 5`,
          text: "Javascript"
        },
      ],
      displayGraph: false
    });
  }
  selectedFile = (event, { value }) => {
    this.setState({
      displayContent: true,
      content: value,
      displayGraph: false
    });
  };
  displayGraph = () => {
    this.setState({
      displayLoader: true,
      displayGraph: false
    });
    setTimeout(() => {
      this.setState({
        displayLoader: false,
        displayGraph: true
      });
    }, 0);
    document.getElementById('this').click();
  };
  render() {
    return (
      <Fragment>
        <Navbar />
        <Container className="process">
          <Card>
            <Form onSubmit={this.handleFormSubmit}>
              <Form.Dropdown
                placeholder="select option"
                // defaultValue={this.state.selected}
                options={this.state.options}
                renderLabel={({ text }) => 1}
                onChange={this.selectedFile}
              />
            </Form>
          </Card>

          {this.state.displayContent ? (
            <Fragment>            <div className="cont-style">
            <div className= "code-container">
              <SyntaxHighlighter className="data"
                language="javascript"
                showLineNumbers="true"
                style={docco}
              >
                {this.state.content}
              </SyntaxHighlighter>

            </div>
            </div>
                 <button
                 className="ui button raised primary right floated deploy-btn"
                 onClick={this.displayGraph}
               >
                 Deploy
                 <a href="#graphs" id="this"></a>
               </button>
               </Fragment>

          ) : (
            ""
          )}

          {this.state.displayGraph === true ? (
            <div className="bargraph" id="grpahs">
            <DisplayGraph/>
            </div>
          ) :(
            ""
          )}
        </Container>
      </Fragment>
    );
  }
}
