import React from 'react';
import { withRouter } from 'react-router-dom';
import { withCookies, Cookies } from 'react-cookie';

import { Link } from "react-router-dom";

import Typography from '@material-ui/core/Typography';
import {List, Grid, Button, Icon, Dialog, DialogTitle, DialogContent,
    DialogContentText, DialogActions,
    TextField} from '@material-ui/core';

import C from '../constants/constants';

import {pick, merge, clone} from 'lodash'
import {json_api_req} from '../util/util.jsx'
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    dialog: {
    },
    field: {

    },
    icon: {
        opacity: 0.5,
    },
    formEl: {
        marginLeft: "60px"
    }
})

const INPUTS = [
    {
        id: 'name',
        type: 'text',
        label: "Name",
        required: true
    },
    {
        id: 'position_title',
        type: 'text',
        label: "Position/Title"
    },
    {
        id: 'affiliations',
        type: 'text',
        label: "Affiliation",
        icon: <Icon>account_balance</Icon>
    }
].concat(C.AUTHOR_LINKS)

class AuthorEditor extends React.Component {
	constructor(props) {
        super(props);
        this.state = {
            form: {}
        }

        this.handle_close = this.handle_close.bind(this)
        this.handle_change = this.handle_change.bind(this)
        this.save = this.save.bind(this)
    }

    componentDidUpdate(prevProps, prevState) {
        let was_open = prevProps.open
        let now_open = this.props.open && this.props.author != null
        let opened = !was_open && now_open
        if (opened) {
            console.log(`Opened author editor`)
            console.log(this.props.author)
            let form = pick(this.props.author, ['name', 'position_title', 'affiliations'])
            merge(form, this.props.author.profile_urls)
            this.setState({form})
        }
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    handle_close() {
        this.props.onClose()
    }

    handle_change = event => {
        let {form} = this.state
        form[event.target.name] = event.target.value
        this.setState({form})
    }

    save() {
        let {author, cookies} = this.props
        let {form} = this.state
        let data = clone(form)
        let author_link_ids = C.AUTHOR_LINKS.map((al) => al.id)
        console.log(author_link_ids)
        let csrf_token = cookies.get('csrftoken')
        data.profile_urls = pick(data, author_link_ids)
        console.log(data)
        json_api_req('PATCH', `/api/authors/${author.slug}/update/`, data, csrf_token, (res) => {
            console.log(res)
            this.handle_close()
        }, (error) => {
            console.error(error)
        })
    }

    render_inputs() {
        let {classes} = this.props
        let {form} = this.state
        return INPUTS.map((io) => {
            let id = io.id
            let value = form[id] || ''
            let input_el = <TextField
                      id={id}
                      key={id}
                      name={id}
                      label={io.label}
                      className={classes.field}
                      value={value}
                      type={io.type}
                      onChange={this.handle_change}
                      margin="normal"
                      fullWidth
                      required={io.required}
                      variant="outlined"
                    />
            return (
                <Grid container key={id}>
                    <Grid item xs={1}>
                        <span className={classes.icon}><img width="30" src={ io.icon } /></span>
                    </Grid>
                    <Grid item xs={9}>
                        <span className={classes.formEl}>{ input_el }</span>
                    </Grid>
                </Grid>
            )
        })
    }

	render() {
        let {classes, author, open} = this.props
        let title = "Edit Author"
        if (author.name != null && author.name.length > 0) title += ` (${author.name})`
		return (
            <div>
                <Dialog open={open}
                        onClose={this.handle_close}
                        aria-labelledby="edit-author"
                        className={classes.dialog}
                        fullWidth>
                    <DialogTitle id="edit-author">{title}</DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                        </DialogContentText>

                        { this.render_inputs() }

                    </DialogContent>

                    <DialogActions>
                        <Button variant="contained" color="primary" onClick={this.save}>save</Button>
                        <Button variant="text" onClick={this.handle_close}>cancel</Button>
                    </DialogActions>
                </Dialog>

            </div>
		)
	}
}

AuthorEditor.defaultProps = {
    author: {},
    open: false
}

export default withRouter(withCookies(withStyles(styles)(AuthorEditor)));
