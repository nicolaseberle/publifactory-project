
<template>
  <div class="wrapper">
      <header class="wrapper">
          <a href="#" title="Check Reviews of the article" class="showreviews active"><i class="el-icon-edit-outline"/> {{reports.length}} partial reviews</a>
          <a href="#" title="Check Comments of the article" class="showcomments"><img src="/static/icons/Comment.svg" class="comments svg" alt="Comments of the article" style="font-size:1.5rem;"><strong> {{article.nbComments}} global reviews</strong></a>
          <a href="#" title="Close this side bar" class="close"><img src="/static/icons/Close.svg" class="close svg" alt="Close this side bar"></a>
      </header>
      <section class="content reviews">
          <tree-comment v-if='reports' :uuidComment="reports.uuidComment" :creationDate="reports.creationDate" :label="reports.content" :anonymousFlag="reports.anonymousFlag" :reviewRequest="reports.reviewRequest" :user="reports.userId" :nodes="reports" v-on:post="reload" :depth="0" :socket="this.socket"></tree-comment>
          <el-card id="card-form-report">

          <el-row v-show='checkedAnonymous' type="flex" class="row-bg" style="margin: 0px 0 5px 0;align-items: center;">

            <div style='font-family:"Calibri-bold";color:#f3f3f3;'>Anonymous peer review</div>
          </el-row>
          <el-row type="flex" class="row-bg" style="margin: 5px 0 20px 0;align-items: center;">
            <el-checkbox v-model="checkedAnonymous"><svg-icon icon-class='private'/></el-checkbox>
            <el-select v-model="reviewRequest" justify="left" placeholder="No revision">
              <el-option
                v-for="item in optionsReview"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>

            <el-button type="primary" class='button-submit' style="margin-left: 5%; justify:end" @click="createReport()" icon="el-icon-upload2">Send your report</el-button>
          </el-row>
          <el-row type="flex" class="row-bg" justify="center">
          <el-input
            type="textarea"
            :rows="7"
            placeholder="Please input"
            v-model="editReport">
          </el-input>
          </el-row>
          </el-card>
      </section>
      <section class="content comments">
        <el-collapse v-model="activeComments" accordion>
          <div v-for="t in Comments">
            <article>this.list
              <section>
                <el-collapse-item :title="t.name" :name="t.id">

                  <div class="figure">
                    <vue-plotly :data="t.currentData" :layout="t.layout" :options="options" />
                  </div>
                    <div style='font-family:"Calibri";font-size:1rem'>
                      {{t.reviewContent}}
                    </div>

                </el-collapse-item>
              </section>
            </article>
          </div>
        </el-collapse>
        <article>
          <section>
            <div class="block">
              <span>Innovative:</span>
              <el-slider
                v-model="innovativescore"
                :step="20"
                show-stops>
              </el-slider>
              <span>Reproducibility:</span>
              <el-slider
                v-model="reproducibilityscore"
                :step="20"
                show-stops>
              </el-slider>
              <span>Writing:</span>
              <el-slider
                v-model="writingscore"
                :step="20"
                show-stops>
              </el-slider>
              <span>Rigorous:</span>
              <el-slider
                v-model="rigorousscore"
                :step="20"
                show-stops>
              </el-slider>
              <span>Statistic relevant:</span>
              <el-slider
                v-model="statisticrelevancescore"
                :step="20"
                show-stops>
              </el-slider>
              <span>Quality of biblio</span>
              <el-slider
                v-model="qualitybiblioscore"
                :step="20"
                show-stops>
              </el-slider>
            </div>
          </section>
        </article>
      </section>
      <!--<footer class="wrapper">
      </footer>-->
  </div>

</template>
<script>
  import locales from '../../locales/article'
  import { mapGetters } from 'vuex'
  import axios from 'axios'
  import { library } from '@fortawesome/fontawesome-svg-core'
  import { faCoffee, faReply } from '@fortawesome/free-solid-svg-icons'
  import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
  // import hightlightText from '../../utils/js/animation/highlight.js';
  import VuePlotly from '@statnett/vue-plotly'
  import TreeComment from './TreeComment.vue'

  import asideRightAnimation from '../../utils/js/animation/aside.right.js'

  var uuidv4 = require('uuid/v4');

  const debug = require('debug')('frontend');

library.add(faCoffee,faReply);

const layout_1 = {
  autosize: true,
  width: 400,
  height: 400,
  polar: {
    radialaxis: {
      visible: false,
      range: [0, 5]
    },
    angularaxis:{
      showline: false,
      rotation: 115
    }
  },
  showlegend: false
};
const layout_2 = {
  autosize: true,
  width: 400,
  height: 400,
  polar: {
    radialaxis: {
      visible: false,
      range: [0, 5]
    },
    angularaxis:{
      showline: false,
      rotation: 115
    }
  },
  showlegend: false
};

export default {
  name: 'reportComponent',
  locales,
  components: {'tree-comment': TreeComment,'font-awesome-icon': FontAwesomeIcon, VuePlotly},
  props: ['uuid', 'socket'],
  data () {
    return {
      qualitybiblioscore:0,
      statisticrelevancescore: 0,
      rigorousscore: 0,
      innovativescore: 0,
      reproducibilityscore: 0,
      writingscore: 0,
      form: {
        firstname: '',
        lastname: '',
        creationDate: ''
      },
      Comments: [{
        name: 'Summary report',
        id: '1',
        reviewContent: 'Reviewer 1 : This article describes a new approach to brief evolutions - Reviewer 2:This subject is close to the article of Albeck & Al.',
        "layout": layout_1,
        currentData: [{
          type: 'scatterpolar',
          r: [4, 5, 2, 1, 5, 4, 4, 4],
          theta: ['Reproducibility', 'Open Data', 'Quality of biblio','Statistic Relevance', 'Rigorous', 'Writing','Innovative', 'Reproducibility'],
          fill: 'toself',
          name: 'review 1'
        },
        {
          type: 'scatterpolar',
          r: [3, 4, 4, 2, 5, 4, 4, 3],
          theta: ['Reproducibility', 'Open Data', 'Quality of biblio','Statistic Relevance', 'Rigorous', 'Writing','Innovative', 'Reproducibility'],
          fill: 'toself',
          name: 'review 2'
        }]
      },
      {
        name: 'Reviewer 1',
        id: '2',
        reviewContent: 'This article describes a new approach to brief evolutions',
        "layout": layout_2,
        currentData: [{
          type: 'scatterpolar',
          r: [4, 5, 2, 1, 5, 4, 4, 4],
          theta: ['Reproducibility', 'Open Data', 'Quality of biblio','Statistic Relevance', 'Rigorous', 'Writing','Innovative', 'Reproducibility'],
          fill: 'toself',
          name: 'review 11'
        }]
      }],
      activeComments: ['1'],
      checkedAnonymous: false,
      activeName: 'first',
      reports : [],
      editReport: '',
      editAnswer: '',
      errors: {message: ''},
      article: '',
      optionsReview: [{
          value: 'No revision',
          label: 'No revision'
        }, {
          value: 'Minor revision',
          label: 'Minor revision'
        }, {
          value: 'Major revision',
          label: 'Major revision'
        }, {
          value: 'Rejection',
          label: 'Rejection'
        }, {
          value: 'Simple comment',
          label: 'Simple comment'
        }],
        reviewRequest: 'Simple comment',
        currentData: {},
        layout: {},
        options:  {},
        selectedComment: -1
    }
  },
  computed: {
    ...mapGetters([
      'userId',
      'roles',
      'accessToken'
    ])
  },
  watch: {
    checkedAnonymous (val) {
      if(val==true){
        $("#card-form-report").css('background-color','purple');
      }else{
        $("#card-form-report").css('background-color','transparent');
      }

    }

  },
  async created() {
      this.id = this.$route.params && this.$route.params.id;
      this.fetchReport(this.id);
      this.fetchArticle(this.id)

  },
  mounted () {
    this.socket.on('ADD_COMMENT', data => this.reports = data.newReports);

    axios.get('/api/users/me',{headers: {
      'Authorization': `Bearer ${this.accessToken}`}
    }).then(response => {
      this.form.email = response.data.email;
      this.form.firstname = response.data.firstname;
      this.form.lastname = response.data.lastname
      });

    this.currentData = [{
      type: 'scatterpolar',
      r: [4, 5, 2, 1, 5, 4, 4, 4],
      theta: ['Reproducibility', 'Open Data', 'Quality of biblio','Statistic Relevance', 'Rigorous', 'Writing','Innovative', 'Reproducibility'],
      fill: 'toself',
      name: 'review 1'
    },
    {
      type: 'scatterpolar',
      r: [3, 4, 4, 2, 5, 4, 4, 3],
      theta: ['Reproducibility', 'Open Data', 'Quality of biblio','Statistic Relevance', 'Rigorous', 'Writing','Innovative', 'Reproducibility'],
      fill: 'toself',
      name: 'review 2'
    }]
  },
  methods: {
    async fetchReport(id) {
        try {
            const response = await axios.get('/api/comments/'  + id, {
                headers: {'Authorization': `Bearer ${this.accessToken}`}
            });
            this.reports = response.data;

            const _allReports = [];
            let stateVector_ = {nbComment:0,nbWarning:0,nbDanger:0,nbSolved:0};
            for (var i=0, _report; _report = this.reports[i]; i++){
                _report.edit = false;
                _report.flagToAnswer = false;
                _report.flagShowingComment = false;
                _allReports.push(_report);
                stateVector_.nbComment = stateVector_.nbComment + 1;
                if(_report.reviewRequest === 'Minor revision')
                    stateVector_.nbWarning = stateVector_.nbWarning + 1;
                if(_report.reviewRequest === 'Major revision')
                    stateVector_.nbDanger = stateVector_.nbDanger + 1;
                if(_report.reviewRequest === 'Resolved')
                    stateVector_.nbResolved = stateVector_.nbResolved + 1
            }

            this.reports = _allReports;
            this.$emit('changecomment',stateVector_)
        } catch (e) {
            console.log(e);
            this.errors.message = 'fetchReport fails';
        }
    },
    async fetchArticle(id) {
      const response = await axios.get('/api/articles/' + id , {
        headers: {'Authorization': `Bearer ${this.accessToken}`}
      });
      this.article = response.data
    },
    async reload() {
        await this.fetchReport(this.id)
    },
    async createReport() {
        let response__;
        debug("createReport : ", this.uuid);
        let now = new Date().getTime();
        this.form.creationDate = now;
        let uuid = '';
        if (this.uuid === '') {
            uuid = String(uuidv4())
        } else {
            uuid = this.uuid
        }

        const newComment = {
            date: now,
            userId: this.userId,
            content: String(this.editReport),
            uuidComment: String(uuid),
            reviewRequest: String(this.reviewRequest),
            commentFlag: false, //it's a review,
            anonymousFlag: this.checkedAnonymous
        };
        this.uuid = '';
        this.checkedAnonymous = false;

        this.article.nbReviews = this.article.nbReviews + 1;

        if (this.editReport) {
            this.editReport = '';
            this.reviewRequest = ''
        }
        try {
            const response = await axios.post('/api/comments/' + this.id, newComment, {
                headers: {'Authorization': `Bearer ${this.accessToken}`}
            });
            this.reports.push(response.data);
            response__ = response.data;
            this.errors.message = 'createReport success ';
            this.socket.emit('NEW_COMMENT', {
                newReports: this.reports
            });
        } catch (e) {
            this.errors.message = 'createReport fails';
        }
    }
  }
}
</script>
<style>
.el-textarea.is-disabled .el-textarea__inner {
    background-color: white;
    border-color: white;
    color: #333;
    cursor: auto;
    font-family: 'Calibri-regular';
    font-size: 1.1rem;
    font-weight: normal;
    padding: 0px 9px;
}
.card-review{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  width: auto;

}
.col-vote{
  margin-left: 10px;
  margin-right: 20px;
  text-align: center;
  align-items: center;
}
.vote-icon{
  text-align: center;
  display: block;
  margin-left: 0px;
  height: auto;
  margin-top: 10px;
  margin-bottom: 10px;
}
.vote-counter{
  display: block;
  text-align: center;
  color: #8E9FBB;
  font-size: 1.2rem;
  font-family: 'DNLTPro-regular';
  margin-left: 0px;
  height: auto;
  margin-top: 10px;
  margin-bottom: 10px;
}

.col-content{
  width:100%;
}

.arrow-up {
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;

  border-bottom: 15px solid #8E9FBB;
}
.arrow-up:hover {
  border-bottom: 15px solid #475069;
}
.arrow-down {
  width: 0;
  height: 0;
  border-left: 15px solid transparent;
  border-right: 15px solid transparent;

  border-top: 15px solid #8E9FBB;
}
.arrow-down:hover {
  border-top: 15px solid #475069;
}


.figure {
    width: 100%;
    height: auto;
    text-align: center;
    margin: 0 2px 0 2px;
    padding: 0 2px 0 2px;
}
.block{
  font-size: 1rem;
  font-family: 'DNLTPro-bold'
}
</style>
