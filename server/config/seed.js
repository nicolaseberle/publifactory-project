/**
 * Populate DB with admin user data on server start
 */

'use strict'

var User = require('../api/user/user.model')
var Article = require('../api/article/article.model');
var Comments = require('../api/comment/comment.model');
var Journals = require('../api/journal/journal.model');
const Figure = require('../api/figure/figure.model');
var RolesArticle = require('../api/roles/article/roles.article.model');
var RolesJournal = require('../api/roles/journal/roles.journal.model');
var Invitation = require('../api/invitations/invitations.model');
var Picture = require('../api/picture/picture.model');
const Historic = require('../api/article/history/history.model')
var seedDB = require('../../config.js').backend.seedDB
var resetDB = require('../../config.js').backend.resetDB

const gen_text = `
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage[english]{babel}
\\usepackage{multicol}

\\setcounter{secnumdepth}{2}

\\title{Title of the article}
\\author{Author's Name}
\\date{2019}

\\begin{document}

\\maketitle

\\begin{multicols}{2}
\\section{Titre 1}
\\subsection{Titre 1.1}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur ultrices sem sit amet massa semper condimentum. Nunc quis ipsum orci. Quisque diam augue, volutpat scelerisque dolor nec, porttitor rhoncus lorem.
$$
\\lim_{a\\to b} \\frac{a}{b}
$$

$$
f(x) = \\int_{-\\infty}^\\infty\\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi
$$

\\end{multicols}
\\end{document}
`
//const gen_text = '<p>Hoc inmaturo interitu ipse quoque sui pertaesus excessit e vita aetatis nono anno atque vicensimo cum quadriennio imperasset. natus apud Tuscos in Massa Veternensi, patre Constantio Constantini fratre imperatoris, matreque Galla sorore Rufini et Cerealis, quos trabeae consulares nobilitarunt et praefecturae.</p>';
const gen_text_2 = '<p>Hoc inmaturo interitu ipse quoque sui pertaesus excessit e vita aetatis nono anno atque vicensimo cum quadriennio imperasset. natus apud Tuscos in Massa Veternensi, patre Constantio Constantini fratre imperatoris, matreque Galla sorore Rufini et Cerealis, quos trabeae consulares nobilitarunt et praefecturae.</p><p><span class=\"ql-formula\" data-value=\"f(x) = \\int_{-\\infty}^\\infty\\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi\">﻿<span contenteditable=\"false\"><span class=\"katex\"><span class=\"katex-mathml\"><math><semantics><mrow><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo><mo>=</mo><msubsup><mo>∫</mo><mrow><mo>−</mo><mi mathvariant=\"normal\">∞</mi></mrow><mi mathvariant=\"normal\">∞</mi></msubsup><mover accent=\"true\"><mi>f</mi><mo>^</mo></mover><mo>(</mo><mi>ξ</mi><mo>)</mo>&amp;ThinSpace;<msup><mi>e</mi><mrow><mn>2</mn><mi>π</mi><mi>i</mi><mi>ξ</mi><mi>x</mi></mrow></msup>&amp;ThinSpace;<mi>d</mi><mi>ξ</mi></mrow><annotation encoding=\"application/x-tex\">f(x) = \\int_{-\\infty}^\\infty\\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"base\"><span class=\"strut\" style=\"height: 1em; vertical-align: -0.25em;\"></span><span style=\"margin-right: 0.10764em;\" class=\"mord mathdefault\">f</span><span class=\"mopen\">(</span><span class=\"mord mathdefault\">x</span><span class=\"mclose\">)</span><span class=\"mspace\" style=\"margin-right: 0.277778em;\"></span><span class=\"mrel\">=</span><span class=\"mspace\" style=\"margin-right: 0.277778em;\"></span></span><span class=\"base\"><span class=\"strut\" style=\"height: 1.37203em; vertical-align: -0.414151em;\"></span><span class=\"mop\"><span style=\"margin-right: 0.19445em; position: relative; top: -0.00056em;\" class=\"mop op-symbol small-op\">∫</span><span class=\"msupsub\"><span class=\"vlist-t vlist-t2\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height: 0.859292em;\"><span class=\"\" style=\"top: -2.34418em; margin-left: -0.19445em; margin-right: 0.05em;\"><span class=\"pstrut\" style=\"height: 2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mtight\"><span class=\"mord mtight\">−</span><span class=\"mord mtight\">∞</span></span></span></span><span class=\"\" style=\"top: -3.2579em; margin-right: 0.05em;\"><span class=\"pstrut\" style=\"height: 2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mtight\">∞</span></span></span></span><span class=\"vlist-s\">​</span></span><span class=\"vlist-r\"><span class=\"vlist\" style=\"height: 0.414151em;\"><span class=\"\"></span></span></span></span></span></span><span class=\"mspace\" style=\"margin-right: 0.166667em;\"></span><span class=\"mord accent\"><span class=\"vlist-t vlist-t2\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height: 0.95788em;\"><span class=\"\" style=\"top: -3em;\"><span class=\"pstrut\" style=\"height: 3em;\"></span><span style=\"margin-right: 0.10764em;\" class=\"mord mathdefault\">f</span></span><span class=\"\" style=\"top: -3.26344em;\"><span class=\"pstrut\" style=\"height: 3em;\"></span><span class=\"accent-body\" style=\"left: -0.08333em;\">^</span></span></span><span class=\"vlist-s\">​</span></span><span class=\"vlist-r\"><span class=\"vlist\" style=\"height: 0.19444em;\"><span class=\"\"></span></span></span></span></span><span class=\"mopen\">(</span><span style=\"margin-right: 0.04601em;\" class=\"mord mathdefault\">ξ</span><span class=\"mclose\">)</span><span class=\"mspace\" style=\"margin-right: 0.166667em;\"></span><span class=\"mord\"><span class=\"mord mathdefault\">e</span><span class=\"msupsub\"><span class=\"vlist-t\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height: 0.849108em;\"><span class=\"\" style=\"top: -3.063em; margin-right: 0.05em;\"><span class=\"pstrut\" style=\"height: 2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mtight\"><span class=\"mord mtight\">2</span><span style=\"margin-right: 0.03588em;\" class=\"mord mathdefault mtight\">π</span><span class=\"mord mathdefault mtight\">i</span><span style=\"margin-right: 0.04601em;\" class=\"mord mathdefault mtight\">ξ</span><span class=\"mord mathdefault mtight\">x</span></span></span></span></span></span></span></span></span><span class=\"mspace\" style=\"margin-right: 0.166667em;\"></span><span class=\"mord mathdefault\">d</span><span style=\"margin-right: 0.04601em;\" class=\"mord mathdefault\">ξ</span></span></span></span></span>﻿</span>  (1)</p><p><br></p>';
const gen_text_3 = '<p> When \(a \ne 0\), there are two solutions to \(ax^2 + bx + c = 0\) and they are $$x = {-b \pm \sqrt{b^2-4ac} \over 2a}.$$</p>';
const figure_1 = '<iframe src="https://ec2-18-220-172-58.us-east-2.compute.amazonaws.com/sample-apps/kmean/?showcase=0" style="border: 1px solid #AAA; width:100%; height:500px; margin:10px 10px 10px 10px;"></iframe>'
const figure_2 = '<iframe src="https://ec2-18-220-172-58.us-east-2.compute.amazonaws.com/sample-apps/hello/?showcase=0" style="border: 1px solid #AAA; width:100%; height:500px;  margin:10px 10px 10px 10px;"></iframe>'
const figure_3 = '<iframe src="http://localhost:3838/app_1/"  style="border: 1px solid #AAA; width:100%; height:540px;  margin:10px 10px 10px 10px;"></iframe>'
const figure_4 = '<iframe src="http://localhost:3838/app_2/"  style="border: 1px solid #AAA; width:100%; height:540px;  margin:10px 10px 10px 10px;"></iframe>'
const figure_5 = '<iframe src="https://ec2-18-220-172-58.us-east-2.compute.amazonaws.com/sample-apps/table/?showcase=0" style="border: 1px solid #AAA; width:100%; height:500px;  margin:10px 10px 10px 10px;"></iframe>'
const figure_6 = '<iframe  src="https://ec2-18-220-172-58.us-east-2.compute.amazonaws.com/sample-apps/boxplot/?showcase=0" style="border: 1px solid #AAA; width:100%; height:500px;  margin:10px 10px 10px 10px;"></iframe>'
const figure_7 = 'true'

// call our promise

// Promise
var populateUsers = new Promise(
    function (resolve, reject) {
      var users = User.find({}).remove()
      .then(() => {
      console.log('remove users')
      let users = createUsers()
      console.log('finished populating users')
      return users
    })
    resolve(users);
})

var populateBase = function () {
    populateUsers.then(function (users) {
      Figure.find({}).remove().exec();
      Picture.find({}).remove().exec();
      Historic.find({}).remove().exec();
      User.find({}, async function (err, users) {
        if (err) throw err
        //createComment(users)
        //await createArticles(users);
        createJournals(users);
        createComment();
        Invitation.find({}).remove().exec();
      })
      }).catch(function (error) {
          console.log(error.message);
      });
};

console.log('flag seedDB: ', seedDB)
if (seedDB === 'true') {
  populateBase();
}

// search for admin user, if no, create one

function createComment(user_tmp) {
  Comments.find({}).remove()
    .then(() => {console.log('finished populating comments');})
    .catch(err => console.log('error populating comments', err));

}

function createJournals(user_tmp) {
  Journals.find({}).remove()
    .then(() => {
      let journals = Journals.create(
      {
        title: 'BioRxiv',
        abstract: "bioRxiv is an open access preprint repository for the biological sciences co-founded by John Inglis and Richard Sever in November 2013. It is hosted by the Cold Spring Harbor Laboratory. As preprints, papers hosted on bioRxiv are not peer-reviewed",
        tags:['Biology'],
        color_1: '#B9DAAC',
        color_2: '#B9DA90',
        users: [user_tmp[2]._id],
        published: true
      }/*,
      {
        title: 'Genetics',
        abstract: "Hae duae provinciae bello quondam piratico catervis mixtae praedonum a Servilio pro consule missae sub iugum factae sunt vectigales. et hae quidem regiones velut in prominenti terrarum lingua positae ob orbe eoo monte Amano disparantur.",
        tags:['Genetics','DNA'],
        color_1: "#F2DFA6",
        color_2: "#E0CF5C",
        users: [user_tmp[3]._id],
        published: true
      },
      {
        title: 'Biochemistry',
        abstract: "Hae duae provinciae bello quondam piratico catervis mixtae praedonum a Servilio pro consule missae sub iugum factae sunt vectigales. et hae quidem regiones velut in prominenti terrarum lingua positae ob orbe eoo monte Amano disparantur.",
        tags:['Chemistry','Biology'],
        color_1: "#FEECD4",
        color_2: "#FAD2BE",
        users: [user_tmp[1]._id],
        published: true
      }*/);
      return journals
  })
  .then(() => {console.log('finished populating journals');})
  .catch(err => console.log('error populating journals', err));

}

async function createArticles (user_tmp, comment_tmp) {
  const resres = await new Promise((resolve) => {
    Article.find({}).remove()
      .then(() => {
        let comments = Comments.create(
          {
            userId: [user_tmp[1]._id],
            content: 'I agree with this part',
            reviewRequest: 'No Revision'
          },
          {
            userId: [user_tmp[1]._id],
            content: 'Need precision',
            reviewRequest: 'Minor revision'
          });

        let article = Article.create(
          {
            title: 'Intestinal barrier dysfunction links metabolic and inflammatory markers of aging to death in Drosophila',
            abstract: "Aging is characterized by a growing risk of disease and death, yet the underlying pathophysiology is poorly understood. Indeed, little is known about how the functional decline of individual...",
            tags: ['Aging', 'death rates', 'curve fitting'],
            authors: [{ 'rank': 1, "author": user_tmp[1]._id, "role": "Lead" },
              { 'rank': 2, "author": user_tmp[2]._id, "role": "Lead" }],
            reviewers: [user_tmp[3]._id, user_tmp[4]._id],
            published: true,
            content: gen_text,

            arr_content: [{
              title: "Introduction",
              content: gen_text,
              block: [
                [{ type: 'text', uuid: 'AA', content: gen_text },
                  { type: 'chart', uuid: 'AB', content: 'New figure' }]],
              path_figure: figure_7
            },
              {
                title: "Results",
                content: gen_text,
                block: [{ type: 'tbd', uuid: '', content: '' }],
                path_figure: figure_6
              },
              {
                title: "Conclusion",
                block: [{ type: 'tbd', uuid: '', content: '' }],
                content: gen_text,
                path_figure: ''
              },
              {
                title: "References",
                block: [{ type: 'text', uuid: 'DA', content: '' }],
                content: '',
                path_figure: ''
              }],
            status: 'Reviewing',
            doi: '10.1073/pnas.1215849110'

          }, {
            title: 'Genetic variation within genes associated with mitochondrial function is significantly associated with later age at onset of Parkinson disease and contributes to disease risk',
            abstract: "Aging is characterized by a growing risk of disease and death, yet the underlying pathophysiology is poorly understood. Indeed, little is known about how the functional decline of individual...",
            authors: [{ 'rank': 1, "author": user_tmp[3]._id, "role": "Lead" },
              { 'rank': 2, "author": user_tmp[5]._id, "role": "Lead" }],
            reviewers: [user_tmp[1]._id, user_tmp[6]._id],
            published: true,
            content: gen_text,
            tags: ['Aging', 'death rates', 'curve fitting'],
            arr_content: [{
              title: "Introduction",
              content: gen_text,
              block: [
                [{ type: 'text', uuid: 'AA', content: gen_text },
                  { type: 'chart', uuid: 'AB', content: 'New figure' }]],
              path_figure: figure_1
            },
              {
                title: "Results",
                content: gen_text,
                block: [{ type: 'tbd', uuid: '', content: '' }],
                path_figure: figure_2
              },
              {
                title: "Conclusion",
                content: gen_text,
                block: [{ type: 'tbd', uuid: '', content: '' }],
                path_figure: ""
              }],
            status: 'Reviewing',
            doi: '10.1073/pnas.1215849110'

          }, {
            title: 'Bayesian decision theoretic design of two-founder experimental crosses given diallel data',
            abstract: "In designing experimental crosses of inbred strains of model organisms, researchers must make a number of decisions. These include the selection of the appropriate strains, the cross design (F2 intercross), and the number of progeny to collect (sample size). These decisions strongly influence the potential for a successful quantitative trait locus (QTL) mapping experiment; good design decisions will lead to efficient and effective science. Thus experimental design deserves careful consideration and planning. Experimental outcomes can be quantified through utility functions using a Bayesian decision theoretic approaches. For QTL mapping experiments, the power to map a QTL is an appealing utility function to maximize. Using any utility function to aid in experimental design will be dependent on assumptions, such as the QTL effect size in the case of power. Rather than arbitrarily selecting QTL effect size values, they can be estimated from pilot data using a Bayesian hierarchical model. The information in the pilot data can be propagated to the utility function, using Markov Chain Monte Carlo (MCMC) to sample from the posterior distribution. Key features of this approach include: 1) distributional summaries of utility, which are preferable to point estimates, and 2) a comprehensive search of the experimental space of crosses of inbred lines for well-designed experiments. We evaluate this Bayesian theoretic approach using diallel crosses as the pilot data. We present results from simulations as well as present examples from both Mendelian and complex traits in the founder strains of the mouse Collaborative Cross. All analyses were performed using our R package, DIDACT (Diallel-Informed Decision theoretic Approach for Crosses Tool), developed to perform Bayesian cross selection based on diallel pilot data.",
            authors: [{ 'rank': 1, "author": user_tmp[0]._id, "role": "Lead" }, {
              'rank': 2,
              "author": user_tmp[1]._id,
              "role": "Lead"
            }],
            arr_content: [{
              title: "Introduction",
              content: gen_text,
              block: [{ type: 'tbd', uuid: '', content: '' }],
              path_figure: ''
            }],
            published: true,
            content: gen_text,
            status: 'Draft',
            tags: ['Aging', 'death rates', 'curve fitting'],
            doi: ''

          },
          {
            title: 'The Elongator Complex is Required to Maintain Locomotor Healthspan in Caenorhabditis elegans',
            abstract: "An inherited mutation is not always immediately toxic. Some mutations cause symptoms during youth, while other mutations cause symptoms during adulthood. Mutant animals that show delayed onset of disease symptoms may provide insights into mechanisms that maintain functional capacities during adulthood. Here, we take advantage of the relatively short lifespan of the nematode Caenorhabditis elegans and develop a novel screening procedure to collect mutants with locomotor deficits that become apparent in adulthood. After ethyl methanesulfonate mutagenesis, we isolated five C. elegans mutant strains that progressively lose adult locomotor activity. In one of the mutant strains, a nonsense mutation in Elongator Complex Protein Component 2 (elpc-2) causes a progressive decline in locomotor function. Other C. elegans elpc mutants were also unable to maintain locomotor function during adulthood, indicating that the Elongator complex plays a critical role in maintaining locomotor healthspan in C. elegans.",
            authors: [{ 'rank': 1, "author": user_tmp[5]._id, "role": "Lead" }, {
              'rank': 2,
              "author": user_tmp[2]._id,
              "role": "Lead"
            }],
            published: true,
            content: gen_text,
            arr_content: [{
              title: "Introduction",
              content: gen_text,
              block: [{ type: 'tbd', uuid: '', content: '' }],
              path_figure: ''
            },
              {
                title: "References",
                block: [{ type: 'text', uuid: 'BA', content: '' }],
                content: gen_text,
                path_figure: ''
              }],
            status: 'Submited',
            tags: ['Aging', 'death rates', 'curve fitting'],
            doi: '',

          });
        resolve(article);
        //resolve()
      })
      .then(() => {
        console.log('finished populating articles')
      })
      .catch(err => console.log('error populating articles', err));
  });
  createRole(/*user_tmp, resres*/);
}

function createRole(/*user, article*/) {
  RolesArticle.find({}).remove().exec();//.then(() => {
    /*
    RolesArticle.create({
      id_user: user[0]._id,
      id_article: article._id,
      right: 'author'
    });
  });*/
  RolesJournal.find({}).remove().exec();
}

function createUsers() {
      let users = User.create({
        provider: 'local',
        role: 'user',
        roles : ['user'],
        name: 'Nicolas',
        username: 'nicolas',
        firstname: 'Nicolas',
        lastname: 'Eberle',
        laboratory: 'ECM',
        email: 'nicolas@example.com',
        password: 'nicolas',
        avatar: '/static/img/Nicolas_Eberle.png',
        field: 'Physics',
        isVerified: true
      }, {
        provider: 'local',
        role: 'admin',
        roles : ['admin'],
        name: 'Admin',
        username: 'admin',
        firstname: 'admin',
        lastname: 'admin',
        laboratory: 'Laboratory of Degenerative Processes, Stress and Aging, UMR8251, Université Paris Diderot, Paris 75013, France.',
        email: 'admin@example.com',
        password: 'admin',
        avatar: '/static/img/Defaut.png',
        field: 'Administrator',
        isVerified: true
      }, {
        provider: 'local',
        role: 'user',
        roles : ['user'],
        name: 'Michael',
        username: 'Michael',
        firstname: 'Michael',
        lastname: 'Rera',
        laboratory: 'Laboratory of Degenerative Processes, Stress and Aging, UMR8251, Université Paris Diderot, Paris 75013, France.',
        email: 'michael@example.com',
        password: 'michael',
        avatar: '/static/img/Michael_Rera.png',
        field: 'Biology',
        tags: ['Developmental Biology','Agging','Drosophila'],
          isVerified: true
      }, {
        provider: 'local',
        role: 'editor',
        roles : ['editor'],
        name: 'Bill',
        username: 'bill',
        firstname: 'Bill',
        lastname: 'Gates',
        laboratory: 'MIT, US',
        email: 'bill@example.com',
        password: 'bill',
        avatar: '/static/img/Bill_Gates.jpeg',
        field: 'Computer Science',
        tags: ['Computer science','software','SaaS'],
          isVerified: true
      },{
        provider: 'local',
        role: 'user',
        roles : ['user'],
        name: 'Emilie',
        username: 'Dambroise Mugniery',
        firstname: 'Emilie',
        lastname: 'Dambroise Mugniery',
        laboratory: 'Laboratory of Degenerative Processes, Stress and Aging, UMR8251, Université Paris Diderot, Paris 75013, France.',
        email: 'emilie@example.com',
        password: 'emilie',
        avatar: '/static/img/Emilie_Dambroise_Mugniery.png',
        field: 'Biology',
          isVerified: true
      }, {
        provider: 'local',
        role: 'user',
        roles : ['user'],
        name: 'Hervé',
        username: 'Hervé',
        firstname: 'Hervé',
        lastname: 'Tricoire',
        laboratory: 'Laboratory of Degenerative Processes, Stress and Aging, UMR8251, Université Paris Diderot, Paris 75013, France.',
        email: 'herve@example.com',
        password: 'herve',
        avatar: '/static/img/Herve_Tricoire.png',
        field: 'Biology',
          isVerified: true
      },{
        provider: 'local',
        role: 'user',
        roles : ['user'],
        name: 'alexandre',
        firstname: 'Alexandre',
        username: 'Alexandre',
        lastname: 'Delga',
        laboratory: '',
        email: 'alex@example.com',
        password: 'alex',
        avatar: '/static/Default.png',
        field: 'Physics',
          isVerified: true
      },
      {
        provider: 'local',
        role: 'user',
        roles : ['user'],
        name: 'caterina',
        firstname: 'Caterina',
        username: 'Cate',
        lastname: 'Cicognani',
        laboratory: 'LGA',
        email: 'cate@example.com',
        password: 'cate',
        avatar: '/static/Default.png',
        field: 'Physics',
        isVerified: true
      },
      {
        provider: 'local',
        role: 'user',
        roles : ['user'],
        name: 'leo',
        firstname: 'Leo',
        username: 'Leo',
        lastname: 'Riberon-Piatyszek',
        laboratory: '',
        email: 'leo.riberon-piatyszek@epitech.eu',
        password: 'Vtqlf&wD',
        avatar: '/static/Default.png',
        field: 'Developer',
        isVerified: true
      });
      return users;
}
