"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dialog = require("tns-core-modules/ui/dialogs");
const Badge = require("~/lib/pop/Badge");
const Log_1 = require("~/lib/Log");
const Scan = require("../../lib/Scan");
const Convert = require("~/lib/Convert");
const RequestPath = require("~/lib/network/RequestPath");
const observable_1 = require("tns-core-modules/data/observable");
const app_1 = require("~/app");
let view = undefined;
function onNavigatingTo(args) {
    view = args.object;
    view.bindingContext = observable_1.fromObject({
        party: undefined,
        config: {},
        qrcode: undefined
    });
    return loadParties();
}
exports.onNavigatingTo = onNavigatingTo;
function updateView(party) {
    if (party) {
        view.bindingContext.config = party.config;
        view.bindingContext.qrcode = party.qrcodePublic();
        view.bindingContext.party = party;
    }
    else {
        view.bindingContext.party = undefined;
        view.bindingContext.config = {};
    }
}
function loadParties() {
    app_1.gData.parties.forEach(party => {
        updateView(party);
    });
}
function addParty() {
    return Scan.scan()
        .then(string => {
        const infos = Convert.jsonToObject(string);
        return Badge.MigrateFrom.conodeGetWallet(infos.address, infos.omniledgerId, infos.id);
    })
        .catch(error => {
        return Dialog.prompt({
            // This is for the iOS simulator that doesn't have a
            // camera - in the simulator it's easy to copy/paste the
            // party-id, whereas on a real phone you wouldn't want
            // to do that.
            title: "Party-ID",
            message: "Couldn't scan party-id. Please enter party-id manually.",
            okButtonText: "Join Party",
            cancelButtonText: "Quit",
            defaultText: "",
            inputType: Dialog.inputType.text
        }).then(r => {
            if (r.result) {
                return Badge.MigrateFrom.conodeGetWallet("tls://gasser.blue:7002", RequestPath.OMNILEDGER_INSTANCE_ID, r.text);
            }
            else {
                throw new Error("Aborted party-id");
            }
        });
    })
        .then(newParty => {
        newParty.attendeesAdd([newParty.keypair.public]);
        return newParty.save()
            .then(() => {
            app_1.gData.addParty(newParty);
            updateView(newParty);
        })
            .catch(error => {
            Dialog.alert({
                title: "Saving error",
                message: "Couldn't save the party: " + error,
                okButtonText: "OK"
            });
        });
    })
        .catch(err => {
        Log_1.default.catch(err, "error:");
        return Dialog.alert({
            title: "Remote parties error",
            message: err,
            okButtonText: "Continue"
        }).then(() => {
            throw new Error(err);
        });
    });
}
exports.addParty = addParty;
function partyTap(args) {
    if (!view.bindingContext.party) {
        return;
    }
    const actionShare = "Share party-definition";
    const actionDelete = "Delete party";
    return Dialog.action({
        message: "What do you want to do?",
        cancelButtonText: "Cancel",
        actions: [actionShare, actionDelete]
    }).then(result => {
        switch (result) {
            case actionShare:
                view.showModal("pages/common/qr-code/qr-code-page", {
                    textToShow: Convert.objectToJson({
                        id: view.bindingContext.party.config.hashStr(),
                        omniledgerId: RequestPath.OMNILEDGER_INSTANCE_ID,
                        address: view.bindingContext.party.linkedConode.tcpAddr
                    }),
                    title: "Party information",
                }, () => {
                }, true);
                break;
            case actionDelete:
                return Dialog.confirm("Do you really want to delete that party?")
                    .then(del => {
                    if (del) {
                        view.bindingContext.party.remove();
                    }
                    updateView(undefined);
                })
                    .catch(err => {
                    Log_1.default.rcatch(err);
                });
        }
    });
}
exports.partyTap = partyTap;
function onReload() {
}
exports.onReload = onReload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGllcy1wYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGFydGllcy1wYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esc0RBQXNEO0FBRXRELHlDQUF5QztBQUN6QyxtQ0FBNEI7QUFDNUIsdUNBQXVDO0FBQ3ZDLHlDQUF5QztBQUN6Qyx5REFBeUQ7QUFDekQsaUVBQTREO0FBRTVELCtCQUE0QjtBQUU1QixJQUFJLElBQUksR0FBUyxTQUFTLENBQUM7QUFFM0Isd0JBQStCLElBQW1CO0lBQzlDLElBQUksR0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3pCLElBQUksQ0FBQyxjQUFjLEdBQUcsdUJBQVUsQ0FBQztRQUM3QixLQUFLLEVBQUUsU0FBUztRQUNoQixNQUFNLEVBQUUsRUFBRTtRQUNWLE1BQU0sRUFBRSxTQUFTO0tBQ3BCLENBQUMsQ0FBQztJQUNILE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN6QixDQUFDO0FBUkQsd0NBUUM7QUFFRCxvQkFBb0IsS0FBa0I7SUFDbEMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNSLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDMUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2xELElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN0QyxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7UUFDdEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ3BDLENBQUM7QUFDTCxDQUFDO0FBRUQ7SUFDSSxXQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUMxQixVQUFVLENBQUMs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QUFDO1FBQ2YsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQztBQXRDRCw0QkFzQ0M7QUFFRDtBQUNBLENBQUM7QUFERCw0QkFDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RXZlbnREYXRhLCBOYXZpZ2F0ZWREYXRhLCBQYWdlLCBWaWV3fSBmcm9tIFwidWkvcGFnZVwiO1xuaW1wb3J0ICogYXMgRGlhbG9nIGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL2RpYWxvZ3NcIjtcblxuaW1wb3J0ICogYXMgQmFkZ2UgZnJvbSBcIn4vbGliL3BvcC9CYWRnZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwifi9saWIvTG9nXCI7XG5pbXBvcnQgKiBhcyBTY2FuIGZyb20gXCIuLi8uLi9saWIvU2NhblwiO1xuaW1wb3J0ICogYXMgQ29udmVydCBmcm9tIFwifi9saWIvQ29udmVydFwiO1xuaW1wb3J0ICogYXMgUmVxdWVzdFBhdGggZnJvbSBcIn4vbGliL25ldHdvcmsvUmVxdWVzdFBhdGhcIjtcbmltcG9ydCB7ZnJvbU9iamVjdH0gZnJvbSBcInRucy1jb3JlLW1vZHVsZXMvZGF0YS9vYnNlcnZhYmxlXCI7XG5pbXBvcnQge0l0ZW1FdmVudERhdGF9IGZyb20gXCJ0bnMtY29yZS1tb2R1bGVzL3VpL2xpc3Qtdmlld1wiO1xuaW1wb3J0IHtnRGF0YX0gZnJvbSBcIn4vYXBwXCI7XG5cbmxldCB2aWV3OiBWaWV3ID0gdW5kZWZpbmVkO1xuXG5leHBvcnQgZnVuY3Rpb24gb25OYXZpZ2F0aW5nVG8oYXJnczogTmF2aWdhdGVkRGF0YSkge1xuICAgIHZpZXcgPSA8Vmlldz5hcmdzLm9iamVjdDtcbiAgICB2aWV3LmJpbmRpbmdDb250ZXh0ID0gZnJvbU9iamVjdCh7XG4gICAgICAgIHBhcnR5OiB1bmRlZmluZWQsXG4gICAgICAgIGNvbmZpZzoge30sXG4gICAgICAgIHFyY29kZTogdW5kZWZpbmVkXG4gICAgfSk7XG4gICAgcmV0dXJuIGxvYWRQYXJ0aWVzKCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVZpZXcocGFydHk6IEJhZGdlLkJhZGdlKSB7XG4gICAgaWYgKHBhcnR5KSB7XG4gICAgICAgIHZpZXcuYmluZGluZ0NvbnRleHQuY29uZmlnID0gcGFydHkuY29uZmlnO1xuICAgICAgICB2aWV3LmJpbmRpbmdDb250ZXh0LnFyY29kZSA9IHBhcnR5LnFyY29kZVB1YmxpYygpO1xuICAgICAgICB2aWV3LmJpbmRpbmdDb250ZXh0LnBhcnR5ID0gcGFydHk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmlldy5iaW5kaW5nQ29udGV4dC5wYXJ0eSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdmlldy5iaW5kaW5nQ29udGV4dC5jb25maWcgPSB7fTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGxvYWRQYXJ0aWVzKCkge1xuICAgIGdEYXRhLnBhcnRpZXMuZm9yRWFjaChwYXJ0eSA9PiB7XG4gICAgICAgIHVwZGF0ZVZpZXcocGFydHkpO1xuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRQYXJ0eSgpIHtcbiAgICByZXR1cm4gU2Nhbi5zY2FuKClcbiAgICAgICAgLnRoZW4oc3RyaW5nID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluZm9zID0gQ29udmVydC5qc29uVG9PYmplY3Qoc3RyaW5nKTtcbiAgICAgICAgICAgIHJldHVybiBCYWRnZS5NaWdyYXRlRnJvbS5jb25vZGVHZXRXYWxsZXQoaW5mb3MuYWRkcmVzcyxcbiAgICAgICAgICAgICAgICBpbmZvcy5vbW5pbGVkZ2VySWQsIGluZm9zLmlkKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgICAgIHJldHVybiBEaWFsb2cucHJvbXB0KHtcbiAgICAgICAgICAgICAgICAvLyBUaGlzIGlzIGZvciB0aGUgaU9TIHNpbXVsYXRvciB0aGF0IGRvZXNuJ3QgaGF2ZSBhXG4gICAgICAgICAgICAgICAgLy8gY2FtZXJhIC0gaW4gdGhlIHNpbXVsYXRvciBpdCdzIGVhc3kgdG8gY29weS9wYXN0ZSB0aGVcbiAgICAgICAgICAgICAgICAvLyBwYXJ0eS1pZCwgd2hlcmVhcyBvbiBhIHJlYWwgcGhvbmUgeW91IHdvdWxkbid0IHdhbnRcbiAgICAgICAgICAgICAgICAvLyB0byBkbyB0aGF0LlxuICAgICAgICAgICAgICAgIHRpdGxlOiBcIlBhcnR5LUlEXCIsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJDb3VsZG4ndCBzY2FuIHBhcnR5LWlkLiBQbGVhc2UgZW50ZXIgcGFydHktaWQgbWFudWFsbHkuXCIsXG4gICAgICAgICAgICAgICAgb2tCdXR0b25UZXh0OiBcIkpvaW4gUGFydHlcIixcbiAgICAgICAgICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiBcIlF1aXRcIixcbiAgICAgICAgICAgICAgICBkZWZhdWx0VGV4dDogXCJcIixcbiAgICAgICAgICAgICAgICBpbnB1dFR5cGU6IERpYWxvZy5pbnB1dFR5cGUudGV4dFxuICAgICAgICAgICAgfSkudGhlbihyID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoci5yZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEJhZGdlLk1pZ3JhdGVGcm9tLmNvbm9kZUdldFdhbGxldChcInRsczovL2dhc3Nlci5ibHVlOjcwMDJcIiwgUmVxdWVzdFBhdGguT01OSUxFREdFUl9JTlNUQU5DRV9JRCwgci50ZXh0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBYm9ydGVkIHBhcnR5LWlkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obmV3UGFydHkgPT4ge1xuICAgICAgICAgICAgbmV3UGFydHkuYXR0ZW5kZWVzQWRkKFtuZXdQYXJ0eS5rZXlwYWlyLnB1YmxpY10pO1xuICAgICAgICAgICAgcmV0dXJuIG5ld1BhcnR5LnNhdmUoKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZ0RhdGEuYWRkUGFydHkobmV3UGFydHkpO1xuICAgICAgICAgICAgICAgICAgICB1cGRhdGVWaWV3KG5ld1BhcnR5KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgICAgICAgICAgIERpYWxvZy5hbGVydCh7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCJTYXZpbmcgZXJyb3JcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiQ291bGRuJ3Qgc2F2ZSB0aGUgcGFydHk6IFwiICsgZXJyb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBva0J1dHRvblRleHQ6IFwiT0tcIlxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICBMb2cuY2F0Y2goZXJyLCBcImVycm9yOlwiKTtcbiAgICAgICAgICAgIHJldHVybiBEaWFsb2cuYWxlcnQoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiBcIlJlbW90ZSBwYXJ0aWVzIGVycm9yXCIsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogZXJyLFxuICAgICAgICAgICAgICAgIG9rQnV0dG9uVGV4dDogXCJDb250aW51ZVwiXG4gICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJ0eVRhcChhcmdzOiBFdmVudERhdGEpIHtcbiAgICBpZiAoIXZpZXcuYmluZGluZ0NvbnRleHQucGFydHkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGlvblNoYXJlID0gXCJTaGFyZSBwYXJ0eS1kZWZpbml0aW9uXCI7XG4gICAgY29uc3QgYWN0aW9uRGVsZXRlID0gXCJEZWxldGUgcGFydHlcIjtcblxuICAgIHJldHVybiBEaWFsb2cuYWN0aW9uKHtcbiAgICAgICAgbWVzc2FnZTogXCJXaGF0IGRvIHlvdSB3YW50IHRvIGRvP1wiLFxuICAgICAgICBjYW5jZWxCdXR0b25UZXh0OiBcIkNhbmNlbFwiLFxuICAgICAgICBhY3Rpb25zOiBbYWN0aW9uU2hhcmUsIGFjdGlvbkRlbGV0ZV1cbiAgICB9KS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgIHN3aXRjaCAocmVzdWx0KSB7XG4gICAgICAgICAgICBjYXNlIGFjdGlvblNoYXJlOlxuICAgICAgICAgICAgICAgIHZpZXcuc2hvd01vZGFsKFwicGFnZXMvY29tbW9uL3FyLWNvZGUvcXItY29kZS1wYWdlXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dFRvU2hvdzogQ29udmVydC5vYmplY3RUb0pzb24oe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHZpZXcuYmluZGluZ0NvbnRleHQucGFydHkuY29uZmlnLmhhc2hTdHIoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9tbmlsZWRnZXJJZDogUmVxdWVzdFBhdGguT01OSUxFREdFUl9JTlNUQU5DRV9JRCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZHJlc3M6IHZpZXcuYmluZGluZ0NvbnRleHQucGFydHkubGlua2VkQ29ub2RlLnRjcEFkZHJcbiAgICAgICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBcIlBhcnR5IGluZm9ybWF0aW9uXCIsXG4gICAgICAgICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBhY3Rpb25EZWxldGU6XG4gICAgICAgICAgICAgICAgcmV0dXJuIERpYWxvZy5jb25maXJtKFwiRG8geW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSB0aGF0IHBhcnR5P1wiKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihkZWwgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuYmluZGluZ0NvbnRleHQucGFydHkucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVWaWV3KHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgTG9nLnJjYXRjaChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvblJlbG9hZCgpIHtcbn0iXX0=