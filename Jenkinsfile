@Library('pipeline') _

def version = '20.1000'

node ('controls') {
    checkout_pipeline("20.1000/bugfix/rename_sbis3_to_wasaby_in_branch")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('wasaby_controls', version)
}
