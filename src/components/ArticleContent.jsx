import React, { useState } from 'react'
import { withCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';

import { get, includes, pick } from 'lodash'

import Button from '@material-ui/core/Button';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import Typography from '@material-ui/core/Typography';

import ArticleActions from './ArticleActions.jsx';
import ArticleFullTextLinks from './ArticleFullTextLinks.jsx';
import ArticleKeywords from './ArticleKeywords.jsx';
import ArticleType from './ArticleType.jsx';
import AuthorList from './AuthorList.jsx';
import FigureList from './shared/FigureList.jsx';
import JournalDOIBadge from './JournalDOIBadge.jsx';
import MiniFigureViewer from './MiniFigureViewer.jsx';
import TransparencyBadge from './TransparencyBadge.jsx';
import TruncatedText from './shared/TruncatedText.jsx';

import { json_api_req, send_height_to_parent, simple_api_req } from '../util/util.jsx'

const styles = theme => ({
  root: {
    '&:hover': {
      '& $articleType': {
        opacity: 0.7,
      }
    }
  },
  articleType: {
    opacity: 0.4,
  },
  title: {
    fontSize: 18,
    lineHeight: '20px',
    fontWeight: 400,
    paddingTop: 0,
    marginTop: 0,
    marginBottom: 3
  },
  titleLink: {
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  authors: {
    color: "#006621",
    marginTop: 3,
    marginBottom: 3,
    lineHeight: 1.24
  },
  abstract: {
    lineHeight: 1.2,
    marginBottom: 10
  },
  journal: {
    fontStyle: 'italic'
  },
  grayedTitle: {
    color: '#BBB',
    fontWeight: 'bold',
    marginRight: 5
  },
  grayedDetails: {
    color: '#BBB'
  },
  secondaryLink: {
    opacity: 0.5
  },
  reviewers: {
    color: "#009933",
    marginRight: 4
  },
  moreIconHolder: {
    position: 'relative',
    height: 36,
    marginTop: '-15px',
    pointerEvents: 'none' // Prevent interference with transparency popups
  },
  moreIconButton: {
    display: 'block',
    color: '#d3d3d3',
    position: 'absolute',
    left: '50%',
    marginLeft: '-24px', // Icon width 36/2 + 6px padding = 24
    padding: 6,
    marginTop: -6,
    pointerEvents: 'auto'
  },
  moreIcon: {
    fontSizeLarge: 32
  },
  additionalLink: {
    marginRight: theme.spacing(1)
  },
  figureList: {
    paddingTop: theme.spacing(1),
  }
});


class ArticleContent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      show_more: false,
      loading: false,
      details_fetched: false,
    };

    this.toggle_show_more = this.toggle_show_more.bind(this)
  }

  toggle_show_more() {
    const { details_fetched, show_more } = this.state
    let {article} = this.props

    this.setState({show_more: !show_more}, () => {
      if (!details_fetched) {
        this.fetch_article_details()
      }
    })
  }

  fetch_article_details() {
    let {article} = this.props
    let {figures, commentaries} = this.state
    console.log("Fetching article details...")
    this.setState({loading: true}, () => {
      json_api_req('GET', `/api/articles/${article.id}/`, {}, null, (res) => {
        this.props.onFetchedArticleDetails(res)
        this.setState({loading: false})
        this.setState({ details_fetched: true })
      }, (err) => {
        this.setState({loading: false})
      })
    })
  }

  empty(text) {
    return text == null || text.length == 0
  }

  created_at() {
    const created = this.props.article.created

    if (!created) {
      return '-'
    }

    const date = new Date(created)
    const months = {
      0: 'January',
      1: 'February',
      2: 'March',
      3: 'April',
      4: 'May',
      5: 'June',
      6: 'July',
      7: 'August',
      8: 'September',
      9: 'October',
      10: 'November',
      11: 'December'
    }

    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    return `Added ${month} ${day}, ${year}`
  }

  componentDidUpdate() {
    send_height_to_parent()
  }

  render() {
    const { loading, show_more } = this.state
    const { article, classes, cookies, is_article_page, show_date, user_session } = this.props;
    const is_expanded = show_more || is_article_page

    const content_links = pick(article, [
      'pdf_url',
      'pdf_downloads',
      'pdf_citations',
      'pdf_views',
      'html_url',
      'html_views',
      'preprint_url',
      'preprint_views',
      'preprint_downloads',
      'updated'
    ])

    const transparency_data = pick(article, [
      'article_type',
      'prereg_protocol_type',
      'reporting_standards_type',
      'commentaries',
      'transparency_urls',
    ])

    const show_figures = article.key_figures || []

    const rd = pick(article, [
      'number_of_reps',
      'original_study',
      'target_effects',
      'original_article_url'
    ])

    const created_at = this.created_at()
    const title = (
      <Typography className={classes.title} variant="h2" color="textPrimary">
        {article.title}
      </Typography>
    )

    let journal
    if (article.under_peer_review) {
      journal = 'Under peer review'
    } else {
      journal = article.journal
    }

    return (
      <div className={classes.root}>
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}
        >
          <div className={classes.articleType}>
            <ArticleType
              type={article.article_type}
              replication_data={rd}
              registered_report={article.prereg_protocol_type == 'REGISTERED_REPORT'}
              article={article}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
              <div hidden={!show_date}>
                <Typography className="ArticleCreatedDate" component="div" variant="body2">
                  {created_at}
                </Typography>
              </div>
              <ArticleActions
                  article={article}
                  cookies={cookies}
                  user_session={user_session}
                  onDelete={this.props.onDelete}
                  onEdit={this.props.onEdit}
                  onUpdate={this.props.onUpdate}
              />
          </div>
        </div>

        <div
          style={{
            borderBottom: 'solid 1px #d3d3d3',
            marginBottom: '0.5rem',
            marginLeft: -12,
            marginRight: -12
          }}
        ></div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            {
              is_article_page ?
                <span>{title}</span>
                :
                  <Link to={`/article/${article.id}`} className={classes.titleLink}>
                    {title}
                  </Link>
            }

            <Typography className={classes.authors} color="textSecondary" gutterBottom variant="body2">
              <AuthorList author_list={article.author_list} year={article.year} in_press={article.in_press} />
            </Typography>

            <Typography className={classes.journal} color="textSecondary" gutterBottom variant="body2">
              <JournalDOIBadge journal={journal} doi={article.doi} />
            </Typography>

            <TransparencyBadge {...transparency_data} article={article}/>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginLeft: '0.5rem',
          }}>
            <ArticleFullTextLinks
              {...content_links}
              hide_last_link={!is_article_page && article.key_figures && article.key_figures.length}
            />
            <div
              hidden={is_expanded}
              style={{
                marginTop: '0.125rem',
                alignSelf: 'flex-end',
              }}
            >
              <MiniFigureViewer figures={article.key_figures}/>
            </div>
          </div>
        </div>

        <div className={classes.moreIconHolder} hidden={is_article_page}>
          <IconButton onClick={this.toggle_show_more} className={classes.moreIconButton}>
            <Icon className={classes.moreIcon} fontSize="large">{show_more ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</Icon>
          </IconButton>
        </div>

        <div id="details" hidden={!is_expanded} style={{ paddingBottom: '0.75rem' }}>
          <Typography className={classes.abstract} variant="body2">
            { is_article_page ?
            <span>{article.abstract}</span>
                :
                  <TruncatedText text={article.abstract} maxLength={540} fontSize={12} />
            }
          </Typography>
          <ArticleKeywords keywords={article.keywords} />
          <div className={classes.figureList}>
            <FigureList
              figures={show_figures}
              loading={loading}
              article_id={article.id}
            />
          </div>
          <div hidden={this.empty(article.author_contributions)}>
            <Typography component="span" variant="body2">
              <span className={classes.grayedTitle}>Author contributions:</span>
              <span className={classes.grayedDetails}><TruncatedText text={ article.author_contributions } maxLength={85} /></span>
            </Typography>
          </div>
          <div hidden={this.empty(article.competing_interests)}>
            <Typography component="span" variant="body2">
              <span className={classes.grayedTitle}>Competing interests:</span>
              <span className={classes.grayedDetails}><TruncatedText text={ article.competing_interests } maxLength={85} /></span>
            </Typography>
          </div>
          <div hidden={this.empty(article.funding_sources)}>
            <Typography component="span" variant="body2">
              <span className={classes.grayedTitle}>Funding sources:</span>
              <span className={classes.grayedDetails}><TruncatedText text={ article.funding_sources } maxLength={85} /></span>
            </Typography>
          </div>
          <Typography component="span" variant="body2" display="inline">
            <span hidden={this.empty(article.peer_review_editor)}>
              <span className={classes.grayedTitle}>Editor:</span>
              <span className={classes.reviewers}>{ article.peer_review_editor || '--' }</span>
            </span>
            <span hidden={this.empty(article.peer_reviewers)}>
              <span className={classes.grayedTitle}>Reviewers:</span>
              <span className={classes.reviewers}>{ article.peer_reviewers || '--' }</span>
            </span>
            <span hidden={article.peer_review_url == null || article.peer_review_url.length == 0}>
              <a href={article.peer_review_url} target="_blank"><Icon fontSize="inherit">link</Icon> Open peer review <Icon fontSize="inherit">open_in_new</Icon></a>
            </span>
          </Typography>

          {
            (article.videos || []).length + (article.presentations || []).length + (article.supplemental_materials || []).length > 0 ?
              (
                <Typography variant="body2" style={{display: 'flex', alignItems: 'center'}} className={classes.secondaryLink}>
                  { article.videos.map(video =>
                    <a href={video.url} target="_blank" key={`video-${video.id}`} className={classes.additionalLink} style={{color: '#000'}}>
                      <Icon title={`Video: ${video.url}`}>videocam</Icon>
                    </a>
                  )}
                  { article.presentations.map(presentation =>
                    <a href={presentation.url} target="_blank" key={`presentation-${presentation.id}`} className={classes.additionalLink}>
                      <Icon title={`Presentation: ${presentation.url}`}>
                        <img src="/sitestatic/icons/slide_icon.png" style={{ width: '1em' }}/>
                      </Icon>
                    </a>
                  )}
                  { article.supplemental_materials.map((material, idx) =>
                    <a href={material.url} target="_blank" key={`material-${material.id}`} className={classes.additionalLink}>
                      {`Suppl. materials #${idx + 1}`}
                    </a>
                  )}
                </Typography>
              )
              : null
          }

          {
            article.media_coverage && article.media_coverage.length ?
              (
                <Typography variant="body2" className={classes.secondaryLink}>
                  <span className={classes.grayedTitle}>News coverage:</span>
                  {
                    article.media_coverage.map((coverage, idx, arr) =>
                      <span key={`coverage-${coverage.id}`}>
                        <a href={coverage.url} target="_blank">
                          {coverage.media_source_name}
                        </a>
                        <span hidden={idx === arr.length - 1} style={{marginLeft: 2, marginRight: 2}}>
                          &#8226;
                        </span>
                      </span>
                    )
                  }
                </Typography>
              )
              : null
          }
        </div>
      </div>
    )
  }
}

ArticleContent.defaultProps = {
	article: {}
};

ArticleContent.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withCookies(withStyles(styles)(ArticleContent));
