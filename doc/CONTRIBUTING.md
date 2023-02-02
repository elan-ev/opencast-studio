Contributing to Opencast Studio
===============================

As an open source project, Opencast Studio welcomes contributions of many forms.
Examples of contributions include:

- Code patches
- Documentation improvements
- Bug reports and patch reviews


Being Pragmatic
---------------

For every rule, there is an exception.
If you find that there is a good reason one of the following rules does not apply to you,
please bring it up and explain why.
We like to be pragmatic if necessary instead of just blindly following rules.


Provide Necessary Information
-----------------------------

If you provide a patch, please also provide an explanation of the reasoning behind this patch.
It is much easier to understand and review code if you know its intention upfront.
If a pull request relates to an existing issue, please also link that issue.

If you want to make us happy, please also provide this reasoning as part of your git commit messages.


Tests
-----

Opencast Studio comes with a set of tests.
Passing these tests is a requirement for all contributions.
These tests are also run automatically on our CI system.

To run tests locally, use::

    npm test

If the CI tests on your pull request fail and you are sure it is not caused by your patch, please complain.
Errors happen and we can easily trigger a new build.
Your patch cannot be merged without these tests passing.


Documentation
-------------

If necessary please also provide the documentation for your change as part of your pull request.
Once a pull request is merged, the documentation should match that code.


Reviews
-------

A reviewer will be assigned to your pull request to ensure that there are no issues.
Once everything is fine, the reviewer will merge the pull request.
Communicate with the reviewer to address any issues.

Please remember that reviewers are only human as well.


Checklist
---------

- Pull request [closes an accompanying issue](https://help.github.com/en/articles/closing-issues-using-keywords) if one exists
- Pull request has a proper title and description
- Appropriate documentation is included
- Code passes automatic tests
- The pull request has a clean commit history
- Commits have a [proper commit message](https://chris.beams.io/posts/git-commit/)
