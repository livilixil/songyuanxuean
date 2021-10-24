import re
import os
import shutil

cur = "."

for i in os.listdir(cur):
    if not os.path.isdir(cur + os.sep + i):
        continue
    # if int(i) < 6:
        # continue
    if i == "summary":
        continue
    cnt = {}
    for j in os.listdir(cur + os.sep + i):
        r = re.match(r'^.*[-_](\w)\.((png)|(jpg))$', j)
        comp = r.groups()[0]
        if comp not in cnt:
            cnt[comp] = 1
        cnt[comp] += 1
        new_name = "%s-%s.%s" % (i, r.groups()[0], r.groups()[1])
        # os.rename(cur + os.sep + i + os.sep + j,
        #   cur + os.sep + i + os.sep + new_name)
        shutil.copy(cur + os.sep + i + os.sep + new_name,
                    (cur + os.sep + "summary" + os.sep + new_name))
        # print(new_name)
