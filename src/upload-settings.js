//; -*- mode: rjsx;-*-
import React from 'react';
import styled from 'styled-components/macro';

class OpencastUploaderSettingsDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...props.uploadSettings };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    this.props.updateUploadSettings(this.state);
  }

  render() {
    return (
      <div className={this.props.className}>
        <header>
          <h1>Configure Opencast Upload</h1>
        </header>

        <main>
          <div className="field">
            <label className="label">Opencast Server URL</label>
            <div className="control">
              <input
                name="serverUrl"
                value={this.state.serverUrl}
                onChange={this.handleInputChange}
                className="input"
                type="text"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Workflow ID</label>
            <div className="control">
              <input
                name="workflowId"
                value={this.state.workflowId}
                onChange={this.handleInputChange}
                className="input"
                type="text"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Opencast Username</label>
            <div className="control">
              <input
                name="loginName"
                value={this.state.loginName}
                onChange={this.handleInputChange}
                className="input"
                type="text"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Opencast Passwort</label>
            <div className="control">
              <input
                name="loginPassword"
                value={this.state.loginPassword}
                onChange={this.handleInputChange}
                className="input"
                type="password"
                autoComplete="off"
              />
            </div>
          </div>
        </main>

        <footer>
          <button className="btn" onClick={this.handleSubmit}>
            OK
          </button>
        </footer>
      </div>
    );
  }
}

const UploaderSettingsDialog = styled(OpencastUploaderSettingsDialog)`
  footer {
    margin-top: 1.5em;
  }

  header h1 {
    font-weight: 300;
  }

  .field:not(:last-child) {
    margin-bottom: 0.75rem;
  }

  .control {
    box-sizing: border-box;
    clear: both;
    font-size: 1rem;
    position: relative;
    text-align: left;
  }

  .label {
    color: #363636;
    display: block;
    font-size: 1rem;
    font-weight: 700;
  }

  .label:not(:last-child) {
    margin-bottom: 0.5em;
  }
`;
export default UploaderSettingsDialog;
