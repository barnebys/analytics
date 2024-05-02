#!/bin/bash

currentBranch=$(git rev-parse --abbrev-ref HEAD)

if [ $# -eq 0 ]
  then
    targetBranch="feature-staging-build"
  else
    if [[ "$1" == feature-staging* ]] 
      then
        targetBranch=$1
    else
      echo "Target branch should starts with feature-staging"
      exit 1
    fi
fi

echo "Source branch : $currentBranch"
echo "Target branch : $targetBranch"

git push origin $currentBranch:$targetBranch --force

